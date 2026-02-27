package auth

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/ksamf/VideoHosting/backend/internal/database"
)

func (a *Auth) AuthMiddleware(c *gin.Context) {
	tokenString, err := c.Cookie("Authorization")
	if err != nil {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(a.config.Jwt.Key), nil
	})

	if err != nil || !token.Valid {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		expRaw, ok := claims["exp"].(float64)
		if !ok {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}
		if float64(time.Now().Unix()) > expRaw {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}
		idStr, ok := claims["sub"].(string)
		if !ok {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}
		id, err := uuid.Parse(idStr)
		if err != nil {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}
		user, err := a.user.GetByID(id)
		if err != nil {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}
		c.Set("user", user)
		c.Next()

	} else {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}
}
func (a *Auth) OptionalAuthMiddleware(c *gin.Context) {
	tokenString, err := c.Cookie("Authorization")
	if err != nil {
		c.Next()
		return
	}
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(a.config.Jwt.Key), nil
	})
	if err != nil || !token.Valid {
		c.Next()
		return
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		c.Next()
		return
	}
	if ok && token.Valid {
		expRaw, ok := claims["exp"].(float64)
		if !ok {
			c.Next()
			return
		}
		if float64(time.Now().Unix()) > expRaw {
			c.Next()
			return
		}
		idStr, ok := claims["sub"].(string)
		if !ok {
			c.Next()
			return
		}
		id, err := uuid.Parse(idStr)
		if err != nil {
			c.Next()
			return
		}

		c.Set("user", &database.User{UserId: id})
		c.Next()

	} else {
		c.Next()
		return
	}
}

func (a *Auth) RateLimiter(c *gin.Context) {
	a.applyRateLimit(c, time.Minute, 60)
}

func (a *Auth) RateLimiterWith(window time.Duration, maxHits int64) gin.HandlerFunc {
	return func(c *gin.Context) {
		a.applyRateLimit(c, window, maxHits)
	}
}

func (a *Auth) applyRateLimit(c *gin.Context, window time.Duration, maxHits int64) {
	if a.redis == nil {
		c.Next()
		return
	}

	subject := c.ClientIP()
	if userValue, exists := c.Get("user"); exists {
		switch u := userValue.(type) {
		case *database.User:
			if u != nil && u.UserId != uuid.Nil {
				subject = "u:" + u.UserId.String()
			}
		case database.User:
			if u.UserId != uuid.Nil {
				subject = "u:" + u.UserId.String()
			}
		}
	}

	key := "rl:" + subject + ":" + c.FullPath()
	info := a.redis.Limit(key, window, maxHits)

	retryAfter := int(time.Until(info.ResetTime).Seconds())
	if retryAfter < 0 {
		retryAfter = 0
	}
	c.Header("X-RateLimit-Limit", strconv.FormatInt(maxHits, 10))
	c.Header("X-RateLimit-Remaining", strconv.FormatInt(info.Remaining, 10))
	c.Header("X-RateLimit-Reset", strconv.FormatInt(info.ResetTime.Unix(), 10))

	if info.RateLimited {
		c.Header("Retry-After", strconv.Itoa(retryAfter))
		c.String(http.StatusTooManyRequests, "Too many requests. Try again later.")
		c.Abort()
	} else {
		c.Next()
	}
}
