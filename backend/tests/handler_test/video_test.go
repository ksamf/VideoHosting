package handler_test

import (
	"bytes"
	"encoding/json"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ksamf/VideoHosting/backend/internal/broker"
	"github.com/ksamf/VideoHosting/backend/internal/config"
	"github.com/ksamf/VideoHosting/backend/internal/database"
	"github.com/ksamf/VideoHosting/backend/internal/handler"
	"github.com/ksamf/VideoHosting/backend/internal/testutil"
	"github.com/stretchr/testify/assert"
)

func newVideoHandler(
	mockVideo *testutil.MockVideo,
	mockUser *testutil.MockUser,
	mockAction *testutil.MockAction,
	mockStorage *testutil.MockStorage,
	mockCache *testutil.MockCache,
	mockBroker *testutil.MockBroker,
) *handler.VideoHandler {
	conf := &config.Config{}
	return handler.NewVideoHandlers(mockVideo, mockAction, mockUser, conf, mockStorage, mockCache, mockBroker)
}

func TestVideoHandler_GetAll_Success(t *testing.T) {
	t.Parallel()

	mockVideo := &testutil.MockVideo{
		GetAllIntFunc: func(limit, offset int) ([]*database.Video, error) {
			return []*database.Video{{VideoId: uuid.New()}, {VideoId: uuid.New()}}, nil
		},
	}
	h := newVideoHandler(
		mockVideo,
		&testutil.MockUser{},
		&testutil.MockAction{},
		&testutil.MockStorage{},
		&testutil.MockCache{
			GetFunc: func(key string) string { return "" },
			SetFunc: func(key string, value any, exp time.Duration) {},
		},
		&testutil.MockBroker{},
	)

	router := gin.New()
	router.GET("/video", h.GetAll)
	req, _ := http.NewRequest(http.MethodGet, "/video?limit=10&offset=0", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var resp []database.Video
	_ = json.Unmarshal(w.Body.Bytes(), &resp)
	assert.Len(t, resp, 2)
}

func TestVideoHandler_Get_InvalidUUID(t *testing.T) {
	t.Parallel()

	h := newVideoHandler(
		&testutil.MockVideo{},
		&testutil.MockUser{},
		&testutil.MockAction{},
		&testutil.MockStorage{},
		&testutil.MockCache{GetFunc: func(key string) string { return "" }},
		&testutil.MockBroker{},
	)

	router := gin.New()
	router.GET("/video/:id", h.Get)
	req, _ := http.NewRequest(http.MethodGet, "/video/not-a-uuid", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestVideoHandler_Delete_Success(t *testing.T) {
	t.Parallel()

	videoID := uuid.New()
	ownerID := uuid.New()
	h := newVideoHandler(
		&testutil.MockVideo{
			DeleteFunc: func(id uuid.UUID) error { return nil },
		},
		&testutil.MockUser{
			GetByVideoIdFunc: func(id uuid.UUID) (*database.User, error) {
				return &database.User{UserId: ownerID}, nil
			},
		},
		&testutil.MockAction{},
		&testutil.MockStorage{
			DeleteObjectFunc: func(object string) error { return nil },
		},
		&testutil.MockCache{},
		&testutil.MockBroker{},
	)

	router := gin.New()
	router.Use(func(c *gin.Context) {
		c.Set("user", database.User{UserId: ownerID})
		c.Next()
	})
	router.DELETE("/video/:id", h.Delete)

	req, _ := http.NewRequest(http.MethodDelete, "/video/"+videoID.String(), nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)
}

func TestVideoHandler_Upload_Success(t *testing.T) {
	t.Parallel()

	userID := uuid.New()
	storageCalled := false
	dbCalled := false
	brokerCalled := false

	h := newVideoHandler(
		&testutil.MockVideo{
			InsertFunc: func(video *database.Video) error {
				dbCalled = true
				return nil
			},
		},
		&testutil.MockUser{},
		&testutil.MockAction{},
		&testutil.MockStorage{
			PutObjectFunc: func(fileName string, file io.Reader) error {
				storageCalled = true
				return nil
			},
			GetURLFunc: func(id uuid.UUID) string { return "https://example.com/" + id.String() },
		},
		&testutil.MockCache{},
		&testutil.MockBroker{
			WriteVideoFunc: func(msg *broker.VideoProcessor) error {
				brokerCalled = true
				return nil
			},
		},
	)

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	_ = writer.WriteField("name", "test video")
	_ = writer.WriteField("description", "desc")
	part, _ := writer.CreateFormFile("video", "video.mp4")
	_, _ = part.Write([]byte("fake mp4 data"))
	_ = writer.Close()

	router := gin.New()
	router.Use(func(c *gin.Context) {
		c.Set("user", &database.User{UserId: userID})
		c.Next()
	})
	router.POST("/video", h.Upload)

	req, _ := http.NewRequest(http.MethodPost, "/video", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.True(t, storageCalled)
	assert.True(t, dbCalled)
	assert.True(t, brokerCalled)
}
