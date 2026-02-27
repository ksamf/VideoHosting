package handler

import (
	"log"

	"github.com/ksamf/VideoHosting/backend/internal/interfaces"
)

func invalidateCachePatterns(cache interfaces.Cache, patterns ...string) {
	for _, pattern := range patterns {
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
