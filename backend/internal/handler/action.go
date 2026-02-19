package handler

import (
	"net/http"

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
	comments, err := h.action.GetComments(videoId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
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
	videoId, _ := uuid.Parse(c.Param("id"))
	var body struct {
		Comment string `json:"comment"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	commentId := uuid.New()
	if err := h.action.AddComment(commentId, userId, videoId, body.Comment); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

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
	c.JSON(http.StatusOK, gin.H{
		"message": "subscribe processed",
	})
}
