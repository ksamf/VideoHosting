package handler

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ksamf/VideoHosting/backend/internal/broker"
	"github.com/ksamf/VideoHosting/backend/internal/database"
	"github.com/ksamf/VideoHosting/backend/internal/interfaces"
)

type UserHandler struct {
	user   interfaces.User
	action interfaces.Action
	s3     interfaces.ObjectStorage
	redis  interfaces.Cache
	kafka  interfaces.MessageBroker
}

func (h *UserHandler) Get(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	cacheKey := fmt.Sprintf("user:%s", id.String())
	cache := h.redis.Get(cacheKey)
	if cache != "" {
		c.Data(http.StatusOK, "application/json", []byte(cache))
		return
	}
	user, err := h.user.GetByID(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if payload, err := json.Marshal(user); err == nil {
		h.redis.Set(cacheKey, string(payload), 5*time.Minute)
		c.Data(http.StatusOK, "application/json; charset=utf-8", payload)
		return
	}
	c.JSON(http.StatusOK, user)
}

func (h *UserHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	err = h.user.Delete(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Video deleted successfully"})
}
func (h *UserHandler) GetByVideoId(c *gin.Context) {
	videoId, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	cacheKey := fmt.Sprintf("video_owner:%s", videoId.String())
	cache := h.redis.Get(cacheKey)
	if cache != "" {
		c.Data(http.StatusOK, "application/json", []byte(cache))
		return
	}
	user, err := h.user.GetByVideoId(videoId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if payload, err := json.Marshal(user); err == nil {
		h.redis.Set(cacheKey, string(payload), 5*time.Minute)
		c.Data(http.StatusOK, "application/json; charset=utf-8", payload)
		return
	}
	c.JSON(http.StatusOK, user)
}
func (h *UserHandler) UploadAvatar(c *gin.Context) {
	userId, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	avatar, avatarHeader, err := c.Request.FormFile("avatar")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "avatar is required"})
		return
	}
	defer avatar.Close()
	ext := strings.ToLower(filepath.Ext(avatarHeader.Filename))

	key := fmt.Sprintf("user/%s/original%s", userId, ext)
	avatar_url := h.s3.GetURL(userId, "user")
	err = h.s3.PutObject(c, key, avatar, avatarHeader.Header.Get("Content-Type"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed upload to s3"})
	}
	err = h.user.UpdateAvatar(userId, avatar_url)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.kafka.WriteAvatar(&broker.UserAvatar{
		UserId:  userId,
		FileExt: ext,
	}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to enqueue"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"msg": "avatar update"})
}
func (h *UserHandler) GetSubscriptionsCount(c *gin.Context) {
	userId, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	period, err := strconv.Atoi(c.Query("period"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	subs, err := h.user.GetSubscriptionsCount(userId, period)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"subscriptions": subs})
}
func (h *UserHandler) Subscribed(c *gin.Context) {
	channelId, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user not exist"})
		return
	}

	isSubscribed, err := h.user.GetSubscribed(user.(*database.User).UserId, channelId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"is_subscribed": isSubscribed})
}
func (h *UserHandler) GetSubscriptions(c *gin.Context) {
	userId, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	subs, err := h.user.GetSubscriptions(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, subs)
}
func (h *UserHandler) GetSubscriptionsVideo(c *gin.Context) {
	userId, err := uuid.Parse(c.Param("id"))
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

	subs, err := h.user.GetSubscriptionsVideo(userId, limit, offset)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, subs)
}
func (h *UserHandler) GetWatchedVideo(c *gin.Context) {
	userId, err := uuid.Parse(c.Param("id"))
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

	watched, err := h.action.GetWatchedVideo(userId, limit, offset)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, watched)
}
func (h *UserHandler) GetLikedVideo(c *gin.Context) {
	userId, err := uuid.Parse(c.Param("id"))
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

	liked, err := h.action.GetLikedVideo(userId, limit, offset)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, liked)
}

func (h *UserHandler) Videos(c *gin.Context) {
	userId, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	videos, err := h.user.Videos(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, videos)
}
func (h *UserHandler) GetViewsCount(c *gin.Context) {
	userId, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	period, err := strconv.Atoi(c.Query("period"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	subs, err := h.user.GetViewsCount(userId, period)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"subscriptions": subs})
}

func (h *UserHandler) ViewVideo(c *gin.Context) {
	videoId, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	user, exists := c.Get("user")
	deviceId, userId := uuid.Nil, uuid.Nil
	var body struct {
		DeviceID       string `json:"device_id"`
		WatchedSeconds int    `json:"watched_seconds"`
	}

	if err := c.ShouldBindJSON(&body); err != nil && !errors.Is(err, io.EOF) {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if !exists {
		deviceId, err = uuid.Parse(body.DeviceID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
	} else {
		userId = user.(*database.User).UserId
		if userId == uuid.Nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
			return
		}
	}
	if userId == uuid.Nil && deviceId == uuid.Nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "userId and deviceId nil"})
		return
	}
	if body.WatchedSeconds <= 0 {
		body.WatchedSeconds = 1
	}
	if err := h.kafka.WriteView(&broker.View{
		UserId:         userId,
		VideoId:        videoId,
		DeviceId:       deviceId,
		IsAnon:         !exists,
		WatchedSeconds: body.WatchedSeconds,
	}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to process view"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "successful"})
}

func (h *UserHandler) GetRecommendation(c *gin.Context) {
	userValue, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	authUser, ok := userValue.(*database.User)
	if !ok || authUser.UserId == uuid.Nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid user"})
		return
	}

	userID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if authUser.UserId != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
		return
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	if limit <= 0 || limit > 100 {
		limit = 20
	}

	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	if offset < 0 {
		offset = 0
	}

	cacheKey := fmt.Sprintf("recommendations:%s:%d:%d", userID.String(), limit, offset)
	if recCache := h.redis.Get(cacheKey); recCache != "" {
		c.Data(http.StatusOK, "application/json; charset=utf-8", []byte(recCache))
		return
	}

	videos, err := h.user.GetRecommendations(userID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get recommendations"})
		return
	}

	if payload, err := json.Marshal(videos); err == nil {
		h.redis.Set(cacheKey, string(payload), 2*time.Minute)
	}

	c.JSON(http.StatusOK, videos)
}
