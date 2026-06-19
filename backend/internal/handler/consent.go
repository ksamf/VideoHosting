package handler

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func requirePublicContentConsent(c *gin.Context, value string) bool {
	if strings.EqualFold(strings.TrimSpace(value), "true") {
		return true
	}
	c.JSON(http.StatusBadRequest, gin.H{"error": "public content consent is required"})
	return false
}
