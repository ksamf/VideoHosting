package utils

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"strconv"

	"github.com/ksamf/VideoHosting/backend/internal/interfaces"
)

func Transcode(
	ctx context.Context,
	s3 interfaces.ObjectStorage,
	inputPath, fileName string,
	targetHeight, crf int,
	encoder string,
) error {

	if _, err := os.Stat(inputPath); os.IsNotExist(err) {
		return fmt.Errorf("input file does not exist: %w", err)
	}

	if encoder == "" {
		encoder = "libx264"
	}

	args := []string{
		"-i", inputPath,
		"-map", "0:v:0",
		"-c:v", encoder,
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

func TranscodeLadder(
	ctx context.Context,
	s3 interfaces.ObjectStorage,
	inputPath, fileName string,
	qualities []int,
	encoder string,
) error {
	if _, err := os.Stat(inputPath); os.IsNotExist(err) {
		return fmt.Errorf("input file does not exist: %w", err)
	}
	if len(qualities) == 0 {
		return fmt.Errorf("qualities are empty")
	}
	if encoder == "" {
		encoder = "libx264"
	}

	tmpDir := filepath.Join(os.TempDir(), fileName+"_ladder")
	if err := os.MkdirAll(tmpDir, 0o755); err != nil {
		return fmt.Errorf("failed to create temp ladder dir: %w", err)
	}
	defer os.RemoveAll(tmpDir)

	splitLabels := make([]string, 0, len(qualities))
	scaleChains := make([]string, 0, len(qualities))
	for i, q := range qualities {
		split := fmt.Sprintf("[v%d]", i)
		out := fmt.Sprintf("[v%dout]", i)
		splitLabels = append(splitLabels, split)
		scaleChains = append(scaleChains, fmt.Sprintf("%sscale=-2:%d%s", split, q, out))
	}
	filterComplex := fmt.Sprintf("[0:v:0]split=%d%s;%s", len(qualities), strings.Join(splitLabels, ""), strings.Join(scaleChains, ";"))

	args := []string{
		"-i", inputPath,
		"-filter_complex", filterComplex,
		"-fflags", "+genpts",
		"-loglevel", "error",
	}

	outputPaths := make([]string, 0, len(qualities))
	for i, q := range qualities {
		crf := 26 - 2*i
		if crf < 8 {
			crf = 8
		}
		if crf > 26 {
			crf = 26
		}

		outPath := filepath.Join(tmpDir, fmt.Sprintf("%d.mp4", q))
		outputPaths = append(outputPaths, outPath)

		args = append(args,
			"-map", fmt.Sprintf("[v%dout]", i),
			"-map", "0:a?",
			"-c:v", encoder,
			"-crf", strconv.Itoa(crf),
			"-c:a", "aac",
			"-b:a", "128k",
			"-movflags", "+faststart",
			"-f", "mp4",
			outPath,
		)
	}

	cmd := exec.CommandContext(ctx, "ffmpeg", args...)
	if output, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("ffmpeg ladder failed: %w: %s", err, string(output))
	}

	for i, q := range qualities {
		file, err := os.Open(outputPaths[i])
		if err != nil {
			return fmt.Errorf("failed to open ladder output %d: %w", q, err)
		}

		key := fmt.Sprintf("video/%s/%d.mp4", fileName, q)
		uploadErr := s3.PutObject(ctx, key, file, "video/mp4")
		closeErr := file.Close()
		if uploadErr != nil {
			return fmt.Errorf("s3 upload failed for %d: %w", q, uploadErr)
		}
		if closeErr != nil {
			return fmt.Errorf("failed to close ladder output %d: %w", q, closeErr)
		}
	}

	return nil
}
