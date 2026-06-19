package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ksamf/VideoHosting/backend/internal/broker"
	"github.com/ksamf/VideoHosting/backend/internal/database"
	"github.com/ksamf/VideoHosting/backend/internal/interfaces"
)

type ActionHandler struct {
	action interfaces.Action
	redis  interfaces.Cache
	kafka  interfaces.MessageBroker
}

func (h *ActionHandler) Reaction(c *gin.Context) {
	userValue, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	userId := userValue.(*database.User).UserId

	videoId, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid video id"})
		return
	}
	reaction := c.Query("r")

	if reaction != "like" && reaction != "dislike" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid reaction"})
		return
	}
	if err := h.kafka.WriteReaction(&broker.Reaction{
		VideoID:  videoId,
		UserID:   userId,
		Reaction: reaction,
	}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to process reaction"})
		return
	}
	invalidateCachePatterns(
		h.redis,
		"video:"+videoId.String(),
		"videos:*",
		"search:*",
	)
	invalidateRecommendationCache(h.redis, userId)

	c.JSON(http.StatusOK, gin.H{
		"message": "reaction recorded",
	})
}
func (h *ActionHandler) GetReaction(c *gin.Context) {
	userValue, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	userId := userValue.(*database.User).UserId

	videoId, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid video id"})
		return
	}
	action, err := h.action.Get(userId, videoId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get reaction"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"reaction": action.Reaction,
	})
}
func (h *ActionHandler) Comments(c *gin.Context) {
	videoId, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	limit, err := strconv.Atoi(c.DefaultQuery("limit", "20"))
	if err != nil || limit <= 0 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}
	offset, err := strconv.Atoi(c.DefaultQuery("offset", "0"))
	if err != nil || offset < 0 {
		offset = 0
	}

	cacheKey := "comments:" + videoId.String() + ":" + strconv.Itoa(limit) + ":" + strconv.Itoa(offset)
	if cached := h.redis.Get(cacheKey); cached != "" {
		c.Data(http.StatusOK, "application/json; charset=utf-8", []byte(cached))
		return
	}

	comments, err := h.action.GetComments(videoId, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if payload, err := json.Marshal(comments); err == nil {
		h.redis.Set(cacheKey, string(payload), time.Minute)
		c.Data(http.StatusOK, "application/json; charset=utf-8", payload)
		return
	}
	c.JSON(http.StatusOK, comments)

}

func (h *ActionHandler) AddComment(c *gin.Context) {
	userValue, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	userId := userValue.(*database.User).UserId
	if userId == uuid.Nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}
	videoId, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid video id"})
		return
	}
	var body struct {
		Comment              string `json:"comment"`
		PublicContentConsent bool   `json:"public_content_consent"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if !body.PublicContentConsent {
		c.JSON(http.StatusBadRequest, gin.H{"error": "public content consent is required"})
		return
	}
	if len(body.Comment) == 0 || len(body.Comment) > 2000 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid comment"})
		return
	}
	commentId := uuid.New()
	if err := h.action.AddComment(commentId, userId, videoId, body.Comment); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	invalidateCachePatterns(
		h.redis,
		"comments:"+videoId.String()+":*",
		"video:"+videoId.String(),
	)

	c.JSON(http.StatusOK, commentId)
}

func (h *ActionHandler) SubUnsubAction(c *gin.Context) {
	userValue, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	userId := userValue.(*database.User).UserId
	action := c.Query("action")
	if action != "sub" && action != "unsub" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user action"})
		return
	}
	channelId, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid channel id"})
		return
	}
	if userId == channelId {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cannot subscribe to your own channel"})
		return
	}
	if err := h.kafka.WriteSubscribe(&broker.Subscribe{
		UserID:    userId,
		ChannelID: channelId,
		Action:    action,
	}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to process subscribe"})
		return
	}
	invalidateCachePatterns(
		h.redis,
		"user:"+channelId.String(),
		"channel_subcount:"+channelId.String()+":*",
	)
	invalidateRecommendationCache(h.redis, userId)
	c.JSON(http.StatusOK, gin.H{
		"message": "subscribe processed",
	})
}
