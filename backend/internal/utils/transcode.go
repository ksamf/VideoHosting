package utils

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"strconv"

	"github.com/ksamf/VideoHosting/backend/internal/interfaces"
)

func Transcode(
	ctx context.Context,
	s3 interfaces.ObjectStorage,
	inputPath, fileName string,
	targetHeight, crf int,
) error {

	if _, err := os.Stat(inputPath); os.IsNotExist(err) {
		return fmt.Errorf("input file does not exist: %w", err)
	}

	args := []string{
		"-i", inputPath,
		"-map", "0:v:0",
		"-c:v", "libx264",
		"-crf", strconv.Itoa(crf),
		"-vf", fmt.Sprintf("scale=-2:%d", targetHeight),
		"-map", "0:a?",
		"-c:a", "aac",
		"-b:a", "128k",
		"-fflags", "+genpts",
		"-loglevel", "error",
		"-movflags", "frag_keyframe+empty_moov",
		"-f", "mp4",
		"pipe:1",
	}

	cmd := exec.CommandContext(ctx, "ffmpeg", args...)

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return fmt.Errorf("stdout pipe error: %w", err)

	}

	if err := cmd.Start(); err != nil {
		return fmt.Errorf("ffmpeg start failed: %w", err)
	}

	key := fmt.Sprintf("video/%s/%d.mp4", fileName, targetHeight)

	uploadErrCh := make(chan error, 1)

	go func() {
		uploadErrCh <- s3.PutObject(ctx, key, stdout, "video/mp4")
	}()

	uploadErr := <-uploadErrCh
	ffmpegErr := cmd.Wait()

	if ffmpegErr != nil {
		return fmt.Errorf("ffmpeg failed: %w", ffmpegErr)
	}

	if uploadErr != nil {
		return fmt.Errorf("s3 upload failed: %w", uploadErr)
	}
	return nil
}
