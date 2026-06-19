package handler_test

import (
	"bytes"
	"encoding/json"
	"io"
	"mime/multipart"
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

func newUserHandler(mockUser *testutil.MockUser) *handler.UserHandler {
	mockAction := &testutil.MockAction{}
	mockStorage := &testutil.MockStorage{}
	mockCache := &testutil.MockCache{}
	mockBroker := &testutil.MockBroker{}
	return handler.NewUserHandlers(mockUser, mockAction, mockStorage, mockCache, mockBroker)
}

func newUserHandlerFull(
	mockUser *testutil.MockUser,
	mockAction *testutil.MockAction,
	mockStorage *testutil.MockStorage,
	mockCache *testutil.MockCache,
	mockBroker *testutil.MockBroker,
) *handler.UserHandler {
	return handler.NewUserHandlers(mockUser, mockAction, mockStorage, mockCache, mockBroker)
}

func TestUserHandler_Get_Success(t *testing.T) {
	t.Parallel()
	id := uuid.New()
	mockUser := &testutil.MockUser{
		GetByIDFunc: func(uid uuid.UUID) (*database.User, error) {
			return &database.User{
				UserId: id,
				Email:  "test@example.com",
			}, nil
		},
	}
	h := newUserHandler(mockUser)

	router := gin.New()
	router.GET("/user/:id", h.Get)

	req, _ := http.NewRequest(http.MethodGet, "/user/"+id.String(), nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var resp database.User
	_ = json.Unmarshal(w.Body.Bytes(), &resp)
	assert.Equal(t, "test@example.com", resp.Email)
}

func TestUserHandler_Get_InvalidUUID(t *testing.T) {
	t.Parallel()
	h := newUserHandler(&testutil.MockUser{})

	router := gin.New()
	router.GET("/user/:id", h.Get)

	req, _ := http.NewRequest(http.MethodGet, "/user/not-a-uuid", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestUserHandler_Delete_Success(t *testing.T) {
	t.Parallel()
	id := uuid.New()
	mockUser := &testutil.MockUser{
		DeleteFunc: func(uid uuid.UUID) error { return nil },
	}
	h := newUserHandler(mockUser)

	router := gin.New()
	router.Use(func(c *gin.Context) {
		c.Set("user", &database.User{UserId: id})
		c.Next()
	})
	router.DELETE("/user/:id", h.Delete)

	req, _ := http.NewRequest(http.MethodDelete, "/user/"+id.String(), nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

func TestUserHandler_Delete_ForbiddenForOtherUser(t *testing.T) {
	t.Parallel()

	authID := uuid.New()
	targetID := uuid.New()
	deleteCalled := false
	h := newUserHandler(&testutil.MockUser{
		DeleteFunc: func(uid uuid.UUID) error {
			deleteCalled = true
			return nil
		},
	})

	router := gin.New()
	router.Use(func(c *gin.Context) {
		c.Set("user", &database.User{UserId: authID})
		c.Next()
	})
	router.DELETE("/user/:id", h.Delete)

	req, _ := http.NewRequest(http.MethodDelete, "/user/"+targetID.String(), nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusForbidden, w.Code)
	assert.False(t, deleteCalled)
}

func TestUserHandler_UploadAvatar_ForbiddenForOtherUser(t *testing.T) {
	t.Parallel()

	authID := uuid.New()
	targetID := uuid.New()
	putCalled := false
	updateCalled := false
	h := newUserHandlerFull(
		&testutil.MockUser{
			UpdateAvatarFunc: func(userId uuid.UUID, avatarURL string) error {
				updateCalled = true
				return nil
			},
		},
		&testutil.MockAction{},
		&testutil.MockStorage{
			PutObjectFunc: func(fileName string, file io.Reader) error {
				putCalled = true
				return nil
			},
		},
		&testutil.MockCache{},
		&testutil.MockBroker{},
	)

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, _ := writer.CreateFormFile("avatar", "avatar.png")
	_, _ = part.Write([]byte("fake png"))
	_ = writer.Close()

	router := gin.New()
	router.Use(func(c *gin.Context) {
		c.Set("user", &database.User{UserId: authID})
		c.Next()
	})
	router.POST("/user/:id/upload", h.UploadAvatar)

	req, _ := http.NewRequest(http.MethodPost, "/user/"+targetID.String()+"/upload", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusForbidden, w.Code)
	assert.False(t, putCalled)
	assert.False(t, updateCalled)
}

func TestUserHandler_UploadAvatar_RejectsUnsupportedFormat(t *testing.T) {
	t.Parallel()

	userID := uuid.New()
	putCalled := false
	h := newUserHandlerFull(
		&testutil.MockUser{},
		&testutil.MockAction{},
		&testutil.MockStorage{
			PutObjectFunc: func(fileName string, file io.Reader) error {
				putCalled = true
				return nil
			},
		},
		&testutil.MockCache{},
		&testutil.MockBroker{},
	)

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, _ := writer.CreateFormFile("avatar", "avatar.html")
	_, _ = part.Write([]byte("<script>alert(1)</script>"))
	_ = writer.Close()

	router := gin.New()
	router.Use(func(c *gin.Context) {
		c.Set("user", &database.User{UserId: userID})
		c.Next()
	})
	router.POST("/user/:id/upload", h.UploadAvatar)

	req, _ := http.NewRequest(http.MethodPost, "/user/"+userID.String()+"/upload", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
	assert.False(t, putCalled)
}

func TestUserHandler_GetWatchedVideo_ForbiddenForOtherUser(t *testing.T) {
	t.Parallel()

	authID := uuid.New()
	targetID := uuid.New()
	actionCalled := false
	h := newUserHandlerFull(
		&testutil.MockUser{},
		&testutil.MockAction{
			GetWatchedFn: func(userId uuid.UUID, limit, offset int) ([]*database.Video, error) {
				actionCalled = true
				return []*database.Video{}, nil
			},
		},
		&testutil.MockStorage{},
		&testutil.MockCache{},
		&testutil.MockBroker{},
	)

	router := gin.New()
	router.Use(func(c *gin.Context) {
		c.Set("user", &database.User{UserId: authID})
		c.Next()
	})
	router.GET("/user/:id/watched", h.GetWatchedVideo)

	req, _ := http.NewRequest(http.MethodGet, "/user/"+targetID.String()+"/watched", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusForbidden, w.Code)
	assert.False(t, actionCalled)
}

func TestUserHandler_Videos_Success(t *testing.T) {
	t.Parallel()
	id := uuid.New()
	mockUser := &testutil.MockUser{
		VideosFunc: func(userId uuid.UUID) ([]*database.Video, error) {
			return []*database.Video{
				{VideoId: uuid.New(), UserId: userId, Name: "User video"},
			}, nil
		},
	}
	h := newUserHandler(mockUser)

	router := gin.New()
	router.Use(func(c *gin.Context) {
		c.Set("user", &database.User{UserId: id})
		c.Next()
	})
	router.GET("/user/:id/video", h.Videos)

	req, _ := http.NewRequest(http.MethodGet, "/user/"+id.String()+"/video", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var resp []*database.Video
	_ = json.Unmarshal(w.Body.Bytes(), &resp)
	assert.Len(t, resp, 1)
	assert.Equal(t, id, resp[0].UserId)
}

func TestUserHandler_Videos_EmptyResultReturnsArray(t *testing.T) {
	t.Parallel()
	id := uuid.New()
	mockUser := &testutil.MockUser{
		VideosFunc: func(userId uuid.UUID) ([]*database.Video, error) {
			return nil, nil
		},
	}
	h := newUserHandler(mockUser)

	router := gin.New()
	router.Use(func(c *gin.Context) {
		c.Set("user", &database.User{UserId: id})
		c.Next()
	})
	router.GET("/user/:id/video", h.Videos)

	req, _ := http.NewRequest(http.MethodGet, "/user/"+id.String()+"/video", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.JSONEq(t, "[]", w.Body.String())
}

func TestUserHandler_GetRecommendation_Success(t *testing.T) {
	t.Parallel()
	id := uuid.New()
	mockUser := &testutil.MockUser{
		GetRecommendationsFunc: func(userID uuid.UUID, limit, offset int) ([]*database.Video, error) {
			return []*database.Video{{VideoId: uuid.New(), Name: "Recommended video"}}, nil
		},
	}
	h := newUserHandler(mockUser)

	router := gin.New()
	router.Use(func(c *gin.Context) {
		c.Set("user", &database.User{UserId: id})
		c.Next()
	})
	router.GET("/user/:id/recommendations", h.GetRecommendation)

	req, _ := http.NewRequest(http.MethodGet, "/user/"+id.String()+"/recommendations", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var resp []*database.Video
	_ = json.Unmarshal(w.Body.Bytes(), &resp)
	assert.Len(t, resp, 1)
	assert.Equal(t, "Recommended video", resp[0].Name)
}

func TestUserHandler_ViewVideo_InvalidatesRecommendationCache(t *testing.T) {
	t.Parallel()

	userID := uuid.New()
	videoID := uuid.New()
	recKey := "recommendations:" + userID.String() + ":20:0"

	var deleted []string
	h := handler.NewUserHandlers(
		&testutil.MockUser{},
		&testutil.MockAction{},
		&testutil.MockStorage{},
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
			WriteViewFunc: func(msg *broker.View) error { return nil },
		},
	)

	router := gin.New()
	router.Use(func(c *gin.Context) {
		c.Set("user", &database.User{UserId: userID})
		c.Next()
	})
	router.POST("/video/:id/views", h.ViewVideo)

	req, _ := http.NewRequest(http.MethodPost, "/video/"+videoID.String()+"/views", bytes.NewBufferString(`{"watched_seconds":12}`))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, deleted, recKey)
}
