package worker

import (
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/ksamf/VideoHosting/backend/internal/broker"
	"github.com/ksamf/VideoHosting/backend/internal/cacheutil"
	"github.com/ksamf/VideoHosting/backend/internal/interfaces"
)

func StartSubscribe(message interfaces.MessageBroker, action interfaces.Action, user interfaces.User, cache interfaces.Cache) {
	batch := make([]*broker.Subscribe, 0, 100)
	for {
		msg, err := message.ReadSubscribe()
		if err != nil {
			processBatchSub(user, action, cache, batch)
			batch = batch[:0]
			time.Sleep(200 * time.Millisecond)
			continue
		}
		batch = append(batch, msg)
		if len(batch) >= 100 {
			processBatchSub(user, action, cache, batch)
			batch = batch[:0]
		}
	}
}

func processBatchSub(user interfaces.User, action interfaces.Action, cache interfaces.Cache, batch []*broker.Subscribe) {
	if len(batch) == 0 {
		return
	}

	type key struct {
		user    uuid.UUID
		channel uuid.UUID
	}

	last := make(map[key]string)
	affectedUsers := make(map[uuid.UUID]struct{})

	for _, r := range batch {
		if r == nil || (r.Action != "sub" && r.Action != "unsub") {
			continue
		}
		last[key{r.UserID, r.ChannelID}] = r.Action
		affectedUsers[r.UserID] = struct{}{}

	}

	for k, a := range last {
		err := action.SubUnsub(k.user, k.channel, a)
		if err != nil {
			log.Println("update subscribe error:", err)
		}
		if err := user.UpsertAuthorAffinityFromSubscribe(k.user, k.channel, a); err != nil {
			log.Println("update author affinity error:", err)
		}
	}

	affectedChannels := make(map[uuid.UUID]bool)

	for k := range last {
		affectedChannels[k.channel] = true
	}

	for channelID := range affectedChannels {
		subs, err := user.GetSubscriptionsCount(channelID, 0)
		if err != nil {
			log.Println("count subscriptions error:", err)
			continue
		}

		if err := user.UpdateSubscriptions(channelID, subs); err != nil {
			log.Println("count subscriptions error:", err)
		}

	}

	userIDs := make([]uuid.UUID, 0, len(affectedUsers))
	for userID := range affectedUsers {
		userIDs = append(userIDs, userID)
	}
	cacheutil.InvalidateRecommendations(cache, userIDs...)
}
