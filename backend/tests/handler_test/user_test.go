package handler_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ksamf/VideoHosting/backend/internal/database"
	"github.com/ksamf/VideoHosting/backend/internal/handler"
	"github.com/ksamf/VideoHosting/backend/internal/testutil"
	"github.com/stretchr/testify/assert"
)

func newUserHandler(mockUser *testutil.MockUser) *handler.UserHandler {
	mockAction := &testutil.MockAction{}
	mockStorage := &testutil.MockStorage{}
	mockCache := &testutil.MockCache{}
	mockBroker := &testutil.MockBroker{}
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
	router.DELETE("/user/:id", h.Delete)

	req, _ := http.NewRequest(http.MethodDelete, "/user/"+id.String(), nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
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
