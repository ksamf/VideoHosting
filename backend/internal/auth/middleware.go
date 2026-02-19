package auth

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
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
		user, err := a.user.GetByID(id)
		if err != nil {
			c.Next()
			return
		}
		c.Set("user", user)
		c.Next()

	} else {
		c.Next()
		return
	}
}
