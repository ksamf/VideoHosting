package worker

import (
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/ksamf/VideoHosting/backend/internal/broker"
	"github.com/ksamf/VideoHosting/backend/internal/interfaces"
)

func StartView(message interfaces.MessageBroker, action interfaces.Action, video interfaces.Video, user interfaces.User) {
	batch := make([]*broker.View, 0, 100)
	for {
		msg, err := message.ReadView()
		if err != nil {
			processBatchView(video, user, action, batch)
			batch = batch[:0]
			time.Sleep(200 * time.Millisecond)
			continue
		}
		batch = append(batch, msg)
		if len(batch) >= 100 {
			processBatchView(video, user, action, batch)
			batch = batch[:0]
		}
	}
}
func processBatchView(video interfaces.Video, user interfaces.User, action interfaces.Action, batch []*broker.View) {
	if len(batch) == 0 {
		return
	}

	type key struct {
		actor          uuid.UUID
		video          uuid.UUID
		anon           bool
		watchedSeconds int
	}

	last := make(map[key]int)
	for _, r := range batch {
		if r == nil || r.VideoId == uuid.Nil {
			continue
		}
		actor := r.UserId
		if r.IsAnon {
			actor = r.DeviceId
		}
		if actor == uuid.Nil {
			continue
		}

		last[key{actor: actor, video: r.VideoId, anon: r.IsAnon, watchedSeconds: r.WatchedSeconds}] += 1
	}

	for k, v := range last {
		watchedSeconds := k.watchedSeconds
		if watchedSeconds <= 0 {
			watchedSeconds = 1
		}
		if !k.anon {
			for i := 0; i < v; i++ {
				if err := user.UpsertAffinitiesFromView(k.actor, k.video, watchedSeconds); err != nil {
					log.Println("upsert affinities from view error:", err)
					break
				}
			}
			if err := action.UpdateView(k.actor, k.video, v); err != nil {
				log.Println("update views error:", err)
			}
		}
		for i := 0; i < v; i++ {
			if err := video.UpsertVideoStatsFromView(k.video, watchedSeconds); err != nil {
				log.Println("upsert video_stats from view error:", err)
				break
			}
		}
		if err := video.UpdateViews(k.video, v); err != nil {
			log.Println("count views error:", err)
		}

	}
}
