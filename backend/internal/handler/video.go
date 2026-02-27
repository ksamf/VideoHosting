package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ksamf/VideoHosting/backend/internal/broker"
	"github.com/ksamf/VideoHosting/backend/internal/config"
	"github.com/ksamf/VideoHosting/backend/internal/database"
	"github.com/ksamf/VideoHosting/backend/internal/interfaces"
	"golang.org/x/sync/singleflight"
)

type VideoHandler struct {
	video  interfaces.Video
	action interfaces.Action
	user   interfaces.User
	config *config.Config
	s3     interfaces.ObjectStorage
	redis  interfaces.Cache
	kafka  interfaces.MessageBroker
	sf     singleflight.Group
}

func (h *VideoHandler) Upload(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	userID := user.(*database.User).UserId
	if userID == uuid.Nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	videoFile, videoHeader, err := c.Request.FormFile("video")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "video is required"})
		return
	}
	defer videoFile.Close()

	ext := strings.ToLower(filepath.Ext(videoHeader.Filename))
	allowed := map[string]bool{
		".mp4": true, ".mov": true, ".avi": true, ".mkv": true, ".webm": true,
	}
	if !allowed[ext] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "unsupported video format"})
		return
	}

	name := c.PostForm("name")
	description := c.PostForm("description")
	tags := c.PostFormArray("tags[]")

	if name == "" || len(name) > 100 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid title"})
		return
	}

	if len(description) > 5000 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "description too long"})
		return
	}

	videoID := uuid.New()

	videoKey := fmt.Sprintf("video/%s/original%s", videoID, ext)

	if err := h.s3.PutObject(
		c.Request.Context(),
		videoKey,
		videoFile,
		videoHeader.Header.Get("Content-Type"),
	); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to upload video"})
		return
	}

	var previewKey *string
	if defaultPreview, defaultPreviewHeader, err := c.Request.FormFile("default_preview"); err == nil {
		defer defaultPreview.Close()
		previewExt := strings.ToLower(filepath.Ext(defaultPreviewHeader.Filename))

		key := fmt.Sprintf("video/%s/default_preview%s", videoID, previewExt)

		if err := h.s3.PutObject(
			c.Request.Context(),
			key,
			defaultPreview,
			defaultPreviewHeader.Header.Get("Content-Type"),
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to upload preview"})
			return
		}
		previewKey = &key

	}

	if previewFile, previewHeader, err := c.Request.FormFile("preview"); err == nil {
		defer previewFile.Close()

		previewExt := strings.ToLower(filepath.Ext(previewHeader.Filename))
		if previewExt != ".jpg" && previewExt != ".png" && previewExt != ".webp" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid preview format"})
			return
		}

		key := fmt.Sprintf("video/%s/preview%s", videoID, previewExt)

		if err := h.s3.PutObject(
			c.Request.Context(),
			key,
			previewFile,
			previewHeader.Header.Get("Content-Type"),
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to upload preview"})
			return
		}

		previewKey = &key
	}

	videoUrl := h.s3.GetURL(videoID, "video")
	previewUrl := ""
	if previewKey != nil {
		previewUrl = h.s3.GetURL(videoID, "video") + strings.ReplaceAll(*previewKey, fmt.Sprintf("video/%s", videoID.String()), "")
	}
	err = h.video.Insert(&database.Video{
		VideoId:     videoID,
		UserId:      userID,
		Name:        name,
		VideoUrl:    videoUrl,
		PreviewUrl:  previewUrl,
		Description: description,
		Tags:        tags,
		Status:      "processing",
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "db error"})
		return
	}

	if err := h.kafka.WriteVideo(&broker.VideoProcessor{
		VideoID: videoID,
		FileExt: ext,
	}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to enqueue"})
		return
	}
	invalidateCachePatterns(h.redis, "videos:*", "search:*")

	c.JSON(http.StatusOK, gin.H{
		"video_id": videoID,
		"status":   "uploading",
	})
}

func (h *VideoHandler) Get(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	cacheKey := "video:" + id.String()

	videoCache := h.redis.Get(cacheKey)
	if videoCache != "" {
		c.Data(http.StatusOK, "application/json; charset=utf-8", []byte(videoCache))
		return
	}
	video, err := h.video.GetByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if video == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "video not found"})
		return
	}
	if payload, err := json.Marshal(video); err == nil {
		h.redis.Set(cacheKey, string(payload), 5*time.Minute)
		c.Data(http.StatusOK, "application/json; charset=utf-8", payload)
		return
	}
	c.JSON(http.StatusOK, video)
}

func (h *VideoHandler) GetAll(c *gin.Context) {
	limit := c.Query("limit")
	offset := c.Query("offset")

	intLimit, err := strconv.Atoi(limit)
	if err != nil {
		intLimit = 10
	}
	intOffset, err := strconv.Atoi(offset)
	if err != nil {
		intOffset = 0
	}

	cacheKey := fmt.Sprintf("videos:%d:%d", intLimit, intOffset)
	h.respondWithCachedJSON(c, cacheKey, 2*time.Minute, func() (any, error) {
		return h.video.GetAll(intLimit, intOffset)
	})
}

func (h *VideoHandler) Search(c *gin.Context) {
	query := strings.TrimSpace(c.Query("q"))
	if query == "" {
		c.JSON(http.StatusOK, []database.Video{})
		return
	}

	limit, err := strconv.Atoi(c.DefaultQuery("limit", "20"))
	if err != nil {
		limit = 20
	}
	offset, err := strconv.Atoi(c.DefaultQuery("offset", "0"))
	if err != nil {
		offset = 0
	}

	cacheKey := fmt.Sprintf("search:%s:%d:%d", strings.ToLower(query), limit, offset)
	h.respondWithCachedJSON(c, cacheKey, time.Minute, func() (any, error) {
		return h.video.Search(query, limit, offset)
	})
}

func (h *VideoHandler) respondWithCachedJSON(
	c *gin.Context,
	cacheKey string,
	ttl time.Duration,
	load func() (any, error),
) {
	if cached := h.redis.Get(cacheKey); cached != "" {
		c.Data(http.StatusOK, "application/json; charset=utf-8", []byte(cached))
		return
	}

	result, err, _ := h.sf.Do(cacheKey, func() (any, error) {
		if cached := h.redis.Get(cacheKey); cached != "" {
			return []byte(cached), nil
		}

		data, err := load()
		if err != nil {
			return nil, err
		}

		payload, err := json.Marshal(data)
		if err != nil {
			return nil, err
		}

		h.redis.Set(cacheKey, string(payload), ttl)
		return payload, nil
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	payload, ok := result.([]byte)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to encode response"})
		return
	}
	c.Data(http.StatusOK, "application/json; charset=utf-8", payload)
}

func (h *VideoHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "user not found"})
		return
	}
	userId := user.(database.User).UserId
	videoOwner, err := h.user.GetByVideoId(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if userId != videoOwner.UserId {
		c.JSON(http.StatusNotFound, gin.H{"message": "user is not video owner"})
		return
	}
	if err = h.video.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err = h.s3.DeleteObject(id.String()); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	invalidateCachePatterns(
		h.redis,
		"video:"+id.String(),
		"videos:*",
		"search:*",
		"comments:"+id.String()+":*",
		"video_owner:"+id.String(),
	)
	c.JSON(http.StatusOK, gin.H{"message": "Video deleted successfully"})
}
