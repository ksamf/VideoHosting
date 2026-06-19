package worker

import (
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/ksamf/VideoHosting/backend/internal/broker"
	"github.com/ksamf/VideoHosting/backend/internal/cacheutil"
	"github.com/ksamf/VideoHosting/backend/internal/interfaces"
)

func StartReaction(message interfaces.MessageBroker, action interfaces.Action, video interfaces.Video, cache interfaces.Cache) {
	batch := make([]*broker.Reaction, 0, 100)
	for {
		msg, err := message.ReadReaction()
		if err != nil {
			processBatch(video, action, cache, batch)
			batch = batch[:0]
			time.Sleep(200 * time.Millisecond)
			continue
		}
		batch = append(batch, msg)
		if len(batch) >= 100 {
			processBatch(video, action, cache, batch)
			batch = batch[:0]
		}
	}
}

func processBatch(video interfaces.Video, action interfaces.Action, cache interfaces.Cache, batch []*broker.Reaction) {
	if len(batch) == 0 {
		return
	}

	type key struct {
		video uuid.UUID
		user  uuid.UUID
	}

	last := make(map[key]string)
	affectedUsers := make(map[uuid.UUID]struct{})

	for _, r := range batch {
		if r == nil {
			continue
		}
		last[key{r.VideoID, r.UserID}] = r.Reaction
		affectedUsers[r.UserID] = struct{}{}
	}

	for k, reaction := range last {
		err := action.UpdateReaction(k.user, k.video, reaction)
		if err != nil {
			log.Println("update reaction error:", err)
		}

	}

	videos := make(map[uuid.UUID]bool)

	for k := range last {
		videos[k.video] = true
	}

	for videoID := range videos {

		likes, dislikes, err := action.CountReactions(videoID)
		if err != nil {
			log.Println("count reactions error:", err)
			continue
		}

		err = video.UpdateLikesDislikes(videoID, likes, dislikes)
		if err != nil {
			log.Println("update video error:", err)
		}
		if err := video.RefreshVideoStatsFromReactions(videoID); err != nil {
			log.Println("refresh video_stats reactions error:", err)
		}
	}

	userIDs := make([]uuid.UUID, 0, len(affectedUsers))
	for userID := range affectedUsers {
		userIDs = append(userIDs, userID)
	}
	cacheutil.InvalidateRecommendations(cache, userIDs...)
}
