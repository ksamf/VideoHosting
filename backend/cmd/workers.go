package main

import (
	"log"

	"github.com/ksamf/VideoHosting/backend/internal/worker"
)

func (app *application) StartWorkers() {

	go worker.StartView(app.kafka, &app.models.Actions, &app.models.Videos, &app.models.Users)
	go worker.StartReaction(app.kafka, &app.models.Actions, &app.models.Videos)
	go worker.StartSubscribe(app.kafka, &app.models.Actions, &app.models.Users)
	go worker.StartVideo(app.kafka, &app.models.Videos, app.s3, app.config.Video)
	go worker.StartUserAvatar(app.kafka, app.s3)
	log.Println("Kafka worker started and waiting for messages...")

}
