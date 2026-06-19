package handler

import (
	"github.com/google/uuid"
	"github.com/ksamf/VideoHosting/backend/internal/cacheutil"
	"github.com/ksamf/VideoHosting/backend/internal/interfaces"
)

func invalidateCachePatterns(cache interfaces.Cache, patterns ...string) {
	cacheutil.InvalidatePatterns(cache, patterns...)
}

func invalidateRecommendationCache(cache interfaces.Cache, userIDs ...uuid.UUID) {
	cacheutil.InvalidateRecommendations(cache, userIDs...)
}
