package interfaces

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Auth interface {
	Me(c *gin.Context)
	GenerateJWT(userId uuid.UUID) (string, error)
	Login(c *gin.Context)
	Logout(c *gin.Context)
	Signup(c *gin.Context)
	AuthMiddleware(c *gin.Context)
	OptionalAuthMiddleware(c *gin.Context)
	RateLimiter(c *gin.Context)
	RateLimiterWith(window time.Duration, maxHits int64) gin.HandlerFunc
}
