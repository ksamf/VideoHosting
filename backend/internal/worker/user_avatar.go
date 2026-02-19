package worker

import (
	"context"
	"errors"
	"log"
	"time"

	"github.com/ksamf/VideoHosting/backend/internal/interfaces"
	"github.com/ksamf/VideoHosting/backend/internal/utils"
)

func StartUserAvatar(broker interfaces.MessageBroker, s3 interfaces.ObjectStorage) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	go startAvatarWorker(ctx, broker, s3)

	select {}
}

func startAvatarWorker(ctx context.Context, broker interfaces.MessageBroker, s3 interfaces.ObjectStorage) {
	for {
		a, err := broker.ReadAvatar()
		if err != nil {
			if errors.Is(err, context.DeadlineExceeded) {
				continue
			}
			log.Printf("[AvatarWorker]Kafka read error: %v", err)
			time.Sleep(time.Second)
			continue
		}
		log.Printf("[AvatarWorker] Processing job %s", a.UserId)

		func() {
			defer func() {
				if r := recover(); r != nil {
					log.Printf("[AvatarWorker] Panic recovered: %v", r)
				}
			}()

			if err := utils.ResizeAvatar(a, s3); err != nil {
				log.Printf("[AvatarWorker] Job %s failed: %v", a.UserId, err)
			} else {
				log.Printf("[AvatarWorker] Job %s completed successfully", a.UserId)
			}
		}()
	}
}
