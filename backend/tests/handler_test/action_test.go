package handler_test

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ksamf/VideoHosting/backend/internal/broker"
	"github.com/ksamf/VideoHosting/backend/internal/database"
	"github.com/ksamf/VideoHosting/backend/internal/handler"
	"github.com/ksamf/VideoHosting/backend/internal/testutil"
	"github.com/redis/go-redis/v9"
	"github.com/stretchr/testify/assert"
)

func newActionHandler(
	mockAction *testutil.MockAction,
	mockCache *testutil.MockCache,
	mockBroker *testutil.MockBroker,
) *handler.ActionHandler {
	return handler.NewActionHandlers(mockAction, mockCache, mockBroker)
}

func TestActionHandler_Reaction_InvalidatesRecommendationCache(t *testing.T) {
	t.Parallel()

	userID := uuid.New()
	videoID := uuid.New()
	recKey := "recommendations:" + userID.String() + ":20:0"

	var deleted []string
	h := newActionHandler(
		&testutil.MockAction{},
		&testutil.MockCache{
			ScanFunc: func(cursor uint64, match string, count int64) *redis.ScanCmd {
				if match == "recommendations:"+userID.String()+":*" {
					return redis.NewScanCmdResult([]string{recKey}, 0, nil)
				}
				return redis.NewScanCmdResult(nil, 0, nil)
			},
			DelFunc: func(key string) {
				deleted = append(deleted, key)
			},
		},
		&testutil.MockBroker{
			WriteReactionFunc: func(msg *broker.Reaction) error { return nil },
		},
	)

	router := gin.New()
	router.Use(func(c *gin.Context) {
		c.Set("user", &database.User{UserId: userID})
		c.Next()
	})
	router.POST("/video/:id/reaction", h.Reaction)

	req, _ := http.NewRequest(http.MethodPost, "/video/"+videoID.String()+"/reaction?r=like", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, deleted, recKey)
}

func TestActionHandler_Subscribe_InvalidatesRecommendationCache(t *testing.T) {
	t.Parallel()

	userID := uuid.New()
	channelID := uuid.New()
	recKey := "recommendations:" + userID.String() + ":20:0"

	var deleted []string
	h := newActionHandler(
		&testutil.MockAction{},
		&testutil.MockCache{
			ScanFunc: func(cursor uint64, match string, count int64) *redis.ScanCmd {
				if match == "recommendations:"+userID.String()+":*" {
					return redis.NewScanCmdResult([]string{recKey}, 0, nil)
				}
				return redis.NewScanCmdResult(nil, 0, nil)
			},
			DelFunc: func(key string) {
				deleted = append(deleted, key)
			},
		},
		&testutil.MockBroker{
			WriteSubscribeFunc: func(msg *broker.Subscribe) error { return nil },
		},
	)

	router := gin.New()
	router.Use(func(c *gin.Context) {
		c.Set("user", &database.User{UserId: userID})
		c.Next()
	})
	router.POST("/user/channel/:id", h.SubUnsubAction)

	req, _ := http.NewRequest(http.MethodPost, "/user/channel/"+channelID.String()+"?action=sub", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, deleted, recKey)
}

func TestActionHandler_AddComment_InvalidVideoID(t *testing.T) {
	t.Parallel()

	userID := uuid.New()
	addCalled := false
	h := newActionHandler(
		&testutil.MockAction{
			AddCommentFn: func(commentId, userId, videoId uuid.UUID, comment string) error {
				addCalled = true
				return nil
			},
		},
		&testutil.MockCache{},
		&testutil.MockBroker{},
	)

	router := gin.New()
	router.Use(func(c *gin.Context) {
		c.Set("user", &database.User{UserId: userID})
		c.Next()
	})
	router.POST("/video/:id/comment", h.AddComment)

	req, _ := http.NewRequest(http.MethodPost, "/video/not-a-uuid/comment", bytes.NewBufferString(`{"comment":"hello"}`))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
	assert.False(t, addCalled)
}

func TestActionHandler_AddComment_AllowsAuthenticatedUserWithoutPublicContentConsent(t *testing.T) {
	t.Parallel()

	userID := uuid.New()
	videoID := uuid.New()
	addCalled := false
	h := newActionHandler(
		&testutil.MockAction{
			AddCommentFn: func(commentId, userId, videoId uuid.UUID, comment string) error {
				addCalled = true
				return nil
			},
		},
		&testutil.MockCache{},
		&testutil.MockBroker{},
	)

	router := gin.New()
	router.Use(func(c *gin.Context) {
		c.Set("user", &database.User{UserId: userID})
		c.Next()
	})
	router.POST("/video/:id/comment", h.AddComment)

	req, _ := http.NewRequest(http.MethodPost, "/video/"+videoID.String()+"/comment", bytes.NewBufferString(`{"comment":"hello"}`))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.True(t, addCalled)
}
