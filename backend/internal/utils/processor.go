package utils

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"slices"
	"time"

	"github.com/ksamf/VideoHosting/backend/internal/broker"
	"github.com/ksamf/VideoHosting/backend/internal/interfaces"
)

var StandardHeights = []int{144, 240, 360, 480, 720, 1080, 1440, 2160, 4320}

type VideoProcessOptions struct {
	SourceCRF            int
	SourcePreset         string
	Encoder              string
}

func ProcessVideo(job *broker.VideoProcessor, db interfaces.Video, s3 interfaces.ObjectStorage, opts VideoProcessOptions) error {
	videoID := job.VideoID.String()
	s3Path := fmt.Sprintf("video/%s/original%s", videoID, job.FileExt)
	tmpCompressedPath := filepath.Join(os.TempDir(), videoID+"_compressed.mp4")
	defer os.Remove(tmpCompressedPath)
	defer s3.DeleteObject(s3Path)

	video, err := db.GetByID(job.VideoID)
	if err != nil {
		return fmt.Errorf("failed to get video status: %w", err)
	}
	if video == nil {
		return fmt.Errorf("video not found: %s", job.VideoID)
	}
	if video.Status == "uploaded" || video.Status == "processed" {
		return nil
	}

	reader, err := s3.GetObjectReader(context.Background(), s3Path)
	if err != nil {
		return fmt.Errorf("s3 open stream failed: %w", err)
	}
	defer reader.Close()

	if opts.SourceCRF <= 0 {
		opts.SourceCRF = 22
	}
	if opts.SourcePreset == "" {
		opts.SourcePreset = "fast"
	}
	if opts.Encoder == "" {
		opts.Encoder = "libx264"
	}

	if err := CompressVideoFromReader(reader, tmpCompressedPath, 0, opts.SourceCRF, opts.SourcePreset); err != nil {
		return fmt.Errorf("source compression failed: %w", err)
	}

	_, height, err := GetResolution(tmpCompressedPath)
	if err != nil {
		return err
	}

	if !slices.Contains(StandardHeights, height) {
		height = ClosestStandardHeight(height)
	}

	qualities := LowerStandardRes(height)
	if err := db.UpdateQuality(job.VideoID, qualities); err != nil {
		return err
	}

	transcodeCtx, cancel := context.WithTimeout(context.Background(), 2*time.Hour)
	defer cancel()
	if err := TranscodeLadder(transcodeCtx, s3, tmpCompressedPath, videoID, qualities, opts.Encoder); err != nil {
		_ = db.UpdateStatus(job.VideoID, "failed")
		return fmt.Errorf("processing failed: %w", err)
	}

	_ = db.UpdateStatus(job.VideoID, "uploaded")
	return nil
}
