package utils

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"os/exec"
	"strconv"
	"time"
)

type VideoInfo struct {
	Streams []struct {
		CodecType string `json:"codec_type"`
		Width     int    `json:"width"`
		Height    int    `json:"height"`
	} `json:"streams"`
}

func GetResolution(path string) (int, int, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx,
		"ffprobe",
		"-v", "quiet",
		"-print_format", "json",
		"-show_streams",
		path,
	)

	output, err := cmd.Output()
	if err != nil {
		return 0, 0, fmt.Errorf("ffprobe failed: %w", err)
	}

	var vInfo VideoInfo
	if err := json.Unmarshal(output, &vInfo); err != nil {
		return 0, 0, fmt.Errorf("unmarshal failed: %w", err)
	}

	for _, s := range vInfo.Streams {
		if s.CodecType == "video" && s.Width > 0 && s.Height > 0 {
			return s.Width, s.Height, nil
		}
	}

	return 0, 0, fmt.Errorf("no video stream found")
}

func CompressVideo(inputPath, outputPath string, targetHeight, crf int, preset string) error {
	if _, err := os.Stat(inputPath); err != nil {
		return fmt.Errorf("input file error: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Minute)
	defer cancel()

	args, err := buildCompressArgs(targetHeight, crf, preset)
	if err != nil {
		return err
	}
	args = append([]string{"-y", "-i", inputPath}, args...)
	args = append(args, outputPath)

	cmd := exec.CommandContext(ctx, "ffmpeg", args...)
	if output, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("ffmpeg compress failed: %w: %s", err, string(output))
	}

	return nil
}

func CompressVideoFromReader(input io.Reader, outputPath string, targetHeight, crf int, preset string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Minute)
	defer cancel()

	args, err := buildCompressArgs(targetHeight, crf, preset)
	if err != nil {
		return err
	}
	args = append([]string{"-y", "-i", "pipe:0"}, args...)
	args = append(args, outputPath)

	cmd := exec.CommandContext(ctx, "ffmpeg", args...)
	cmd.Stdin = input
	if output, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("ffmpeg stream compress failed: %w: %s", err, string(output))
	}

	return nil
}

func buildCompressArgs(targetHeight, crf int, preset string) ([]string, error) {
	if preset == "" {
		preset = "medium"
	}
	if crf < 0 || crf > 51 {
		return nil, fmt.Errorf("invalid crf %d: expected 0..51", crf)
	}

	args := []string{
		"-map", "0:v:0",
		"-c:v", "libx264",
		"-preset", preset,
		"-crf", strconv.Itoa(crf),
		"-pix_fmt", "yuv420p",
		"-r", "30",
		"-g", "60",
		"-keyint_min", "60",
		"-sc_threshold", "0",
	}
	if targetHeight > 0 {
		args = append(args, "-vf", fmt.Sprintf("scale=-2:%d", targetHeight))
	}
	args = append(args,
		"-map", "0:a?",
		"-c:a", "aac",
		"-b:a", "128k",
		"-movflags", "+faststart",
		"-loglevel", "error",
	)
	return args, nil
}
