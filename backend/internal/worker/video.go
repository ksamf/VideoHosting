package worker

import (
	"context"
	"errors"
	"log"
	"time"

	"github.com/ksamf/VideoHosting/backend/internal/config"
	"github.com/ksamf/VideoHosting/backend/internal/database"
	"github.com/ksamf/VideoHosting/backend/internal/interfaces"
	"github.com/ksamf/VideoHosting/backend/internal/utils"
)

func StartVideo(broker interfaces.MessageBroker, db interfaces.Video, s3 interfaces.ObjectStorage, cfg config.VideoProcessingConfig) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	go startProcessorWorker(ctx, broker, db, s3, cfg)
	// go startSubtitleWorker(ctx, broker, db)
	// go startUpscaleWorker(ctx, broker, db)

	select {}
}

func startProcessorWorker(ctx context.Context, broker interfaces.MessageBroker, db interfaces.Video, s3 interfaces.ObjectStorage, cfg config.VideoProcessingConfig) {
	for {
		vp, err := broker.ReadProcessor()
		if err != nil {
			if errors.Is(err, context.DeadlineExceeded) {
				continue
			}
			log.Printf("[ProcessorWorker]Kafka read error: %v", err)
			time.Sleep(time.Second)
			continue
		}
		log.Printf("[ProcessorWorker] Processing job %s", vp.VideoID)

		func() {
			defer func() {
				if r := recover(); r != nil {
					log.Printf("[ProcessorWorker] Panic recovered: %v", r)
				}
			}()

			retries := cfg.RetryAttempts
			if retries < 1 {
				retries = 1
			}
			backoff := time.Duration(cfg.RetryBackoffMS) * time.Millisecond
			if backoff <= 0 {
				backoff = 500 * time.Millisecond
			}

			opts := utils.VideoProcessOptions{
				SourceCRF:    cfg.SourceCRF,
				SourcePreset: cfg.SourcePreset,
				Encoder:      cfg.Encoder,
			}

			var procErr error
			for attempt := 1; attempt <= retries; attempt++ {
				procErr = utils.ProcessVideo(vp, db, s3, opts)
				if procErr == nil {
					log.Printf("[ProcessorWorker] Job %s completed successfully", vp.VideoID)
					return
				}
				if attempt < retries {
					time.Sleep(backoff * time.Duration(attempt))
				}
			}

			log.Printf("[ProcessorWorker] Job %s failed after %d attempts: %v", vp.VideoID, retries, procErr)
			if err := db.UpdateStatus(vp.VideoID, database.VideoStatusFailed); err != nil {
				log.Printf("[ProcessorWorker] failed to update status for %s: %v", vp.VideoID, err)
			}
		}()
	}
}

func startSubtitleWorker(ctx context.Context, broker interfaces.MessageBroker, db interfaces.Video) {
	for {
		vs, err := broker.ReadSubtitle()
		if err != nil {
			if errors.Is(err, context.DeadlineExceeded) {
				continue
			}
			log.Printf("[SubtitleWorker]Kafka read error: %v", err)
			time.Sleep(time.Second)
			continue
		}
		log.Printf("[SubtitleWorker] Processing job %s (%s)", vs.VideoID, vs.Language)
		if vs.Done {
			if err := db.UpdateLanguage(vs.VideoID, vs.Language); err != nil {
				log.Printf("[SubtitleWorker] Failed to update language: %v", err)
			}
		}
	}
}

func startUpscaleWorker(ctx context.Context, broker interfaces.MessageBroker, db interfaces.Video) {
	for {
		vu, err := broker.ReadUpscale()
		if err != nil {
			if errors.Is(err, context.DeadlineExceeded) {
				continue
			}
			log.Printf("[UpscaleWorker] Kafka read error: %v", err)
			time.Sleep(time.Second)
			continue
		}
		log.Printf("[UpscaleWorker] Processing job %s", vu.VideoID)
		if vu.Done {
			if err := db.UpdateUpscaled(vu.VideoID); err != nil {
				log.Printf("[UpscaleWorker] Failed to update upscaled flag: %v", err)
			}
		}
	}
}
