package utils

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"sync"
	"time"

	"github.com/ksamf/VideoHosting/backend/internal/broker"
	"github.com/ksamf/VideoHosting/backend/internal/interfaces"
)

func ResizeAvatar(job *broker.UserAvatar, s3 interfaces.ObjectStorage) error {
	sizes := []int{64, 128, 256}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
	defer cancel()

	userID := job.UserId.String()
	s3InputKey := fmt.Sprintf("user/%s/original%s", userID, job.FileExt)

	tmpInputPath := filepath.Join(os.TempDir(), userID+"_input"+job.FileExt)
	defer os.Remove(tmpInputPath)

	if err := s3.GetObject(s3InputKey, tmpInputPath); err != nil {
		return fmt.Errorf("s3 download failed: %w", err)
	}

	sem := make(chan struct{}, 2)
	errCh := make(chan error, len(sizes))
	var wg sync.WaitGroup

	for _, size := range sizes {
		wg.Add(1)

		size := size
		go func(size int) {
			defer wg.Done()
			sem <- struct{}{}
			defer func() { <-sem }()

			args := []string{
				"-y",
				"-i", tmpInputPath,
				"-vf", fmt.Sprintf(
					"scale=%d:%d:force_original_aspect_ratio=increase,crop=%d:%d",
					size, size, size, size,
				),
				"-f", "image2",
				"-vcodec", "mjpeg",
				"pipe:1",
			}
			cmd := exec.CommandContext(ctx, "ffmpeg", args...)

			stdout, err := cmd.StdoutPipe()
			if err != nil {
				errCh <- fmt.Errorf("[%d] stdout pipe error: %w", size, err)
				return
			}

			if err := cmd.Start(); err != nil {
				errCh <- fmt.Errorf("[%d] ffmpeg start failed: %w", size, err)
				return
			}

			key := fmt.Sprintf("user/%s/avatar_%d.jpg", userID, size)

			uploadErr := s3.PutObject(ctx, key, stdout, "image/jpeg")

			ffmpegErr := cmd.Wait()

			if ffmpegErr != nil {
				errCh <- fmt.Errorf("[%d] ffmpeg failed: %w", size, ffmpegErr)
				return
			}

			if uploadErr != nil {
				errCh <- fmt.Errorf("[%d] s3 upload failed: %w", size, uploadErr)
				return
			}
		}(size)
	}

	wg.Wait()
	close(errCh)

	var failed bool
	for err := range errCh {
		if err != nil {
			log.Println("resize error:", err)
			failed = true
		}
	}

	if failed {
		return fmt.Errorf("avatar processing failed")
	}

	if err := s3.DeleteObject(s3InputKey); err != nil {
		log.Println("warn: failed to delete original avatar:", err)
	}

	return nil
}
