package utils

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"slices"
	"time"

	"github.com/ksamf/VideoHosting/backend/internal/broker"
	"github.com/ksamf/VideoHosting/backend/internal/interfaces"
)

var StandardHeights = []int{144, 240, 360, 480, 720, 1080, 1440, 2160, 4320}

func ProcessVideo(job *broker.VideoProcessor, db interfaces.Video, s3 interfaces.ObjectStorage) error {
	videoID := job.VideoID.String()
	s3Path := fmt.Sprintf("video/%s/original%s", videoID, job.FileExt)
	tmpInputPath := filepath.Join(os.TempDir(), videoID+"_input"+job.FileExt)
	defer os.Remove(tmpInputPath)
	defer s3.DeleteObject(s3Path)

	if err := s3.GetObject(s3Path, tmpInputPath); err != nil {
		return fmt.Errorf("s3 download failed: %w", err)
	}

	_, height, err := GetResolution(tmpInputPath)
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

	sem := make(chan struct{}, 2)
	errCh := make(chan error, len(qualities))

	for i, q := range qualities {
		i, q := i, q
		crf := 26 - 2*i
		if crf < 8 {
			crf = 8
		}
		if crf > 26 {
			crf = 26
		}

		go func() {
			sem <- struct{}{}
			defer func() { <-sem }()

			ctx, cancel := context.WithTimeout(context.Background(), 30*time.Minute)
			defer cancel()

			if err := Transcode(ctx, s3, tmpInputPath, videoID, q, crf); err != nil {
				errCh <- err
				return
			}
			errCh <- nil
		}()
	}

	var failed bool
	for range qualities {
		if err := <-errCh; err != nil {
			log.Println("transcode error:", err)
			failed = true
		}
	}

	if failed {
		_ = db.UpdateStatus(job.VideoID, "failed")
		return fmt.Errorf("processing failed")
	}

	_ = db.UpdateStatus(job.VideoID, "uploaded")
	return nil
}
