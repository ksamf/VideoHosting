package cacheutil

import (
	"log"

	"github.com/google/uuid"
	"github.com/ksamf/VideoHosting/backend/internal/interfaces"
)

func InvalidatePatterns(cache interfaces.Cache, patterns ...string) {
	if cache == nil {
		return
	}

	for _, pattern := range patterns {
		if pattern == "" {
			continue
		}

		var cursor uint64
		for {
			cmd := cache.Scan(cursor, pattern, 100)
			if cmd == nil {
				break
			}

			keys, nextCursor, err := cmd.Result()
			if err != nil {
				log.Printf("cache scan failed pattern=%q err=%v", pattern, err)
				break
			}

			for _, key := range keys {
				cache.Del(key)
			}

			if nextCursor == 0 {
				break
			}
			cursor = nextCursor
		}
	}
}

func InvalidateRecommendations(cache interfaces.Cache, userIDs ...uuid.UUID) {
	if cache == nil || len(userIDs) == 0 {
		return
	}

	patterns := make([]string, 0, len(userIDs))
	seen := make(map[uuid.UUID]struct{}, len(userIDs))

	for _, userID := range userIDs {
		if userID == uuid.Nil {
			continue
		}
		if _, ok := seen[userID]; ok {
			continue
		}
		seen[userID] = struct{}{}
		patterns = append(patterns, "recommendations:"+userID.String()+":*")
	}

	InvalidatePatterns(cache, patterns...)
}
