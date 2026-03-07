package testutil

import (
	"github.com/google/uuid"
	"github.com/ksamf/VideoHosting/backend/internal/database"
)

type MockVideo struct {
	InsertFunc                       func(video *database.Video) error
	GetAllFunc                       func(limit, offset string, getURL func(uuid.UUID) string) ([]*database.Video, error)
	GetAllIntFunc                    func(limit, offset int) ([]*database.Video, error)
	GetByChannelFunc                 func(channelID uuid.UUID, limit, offset int) ([]*database.Video, error)
	SearchFunc                       func(query string, limit, offset int) ([]*database.Video, error)
	GetByIDFunc                      func(id uuid.UUID, getURL func(uuid.UUID) string) (*database.Video, error)
	GetByIDSimpleFunc                func(id uuid.UUID) (*database.Video, error)
	DeleteFunc                       func(id uuid.UUID) error
	GetLanguageFunc                  func(id uuid.UUID) (string, error)
	UpdateStatusFunc                 func(videoId uuid.UUID, status string) error
	UpdateLanguageFunc               func(videoId uuid.UUID, lang string) error
	UpdateUpscaledFunc               func(videoId uuid.UUID) error
	UpdateQualityFunc                func(videoId uuid.UUID, height int) error
	UpdateQualityHeightsFunc         func(videoId uuid.UUID, heights []int) error
	UpdateViewsFunc                  func(videoId uuid.UUID, views int) error
	UpdateLikesFunc                  func(videoId uuid.UUID, likes int64) error
	UpdateDislikesFunc               func(videoId uuid.UUID, dislikes int64) error
	UpdateLikesDislikesFunc          func(videoId uuid.UUID, likes int, dislikes int) error
	UpsertVideoStatsFromViewFunc     func(videoID uuid.UUID, watchedSeconds int) error
	RefreshVideoStatsFromReactionsFn func(videoID uuid.UUID) error
}

func (m *MockVideo) Insert(video *database.Video) error {
	if m.InsertFunc != nil {
		return m.InsertFunc(video)
	}
	return nil
}

func (m *MockVideo) GetAll(limit, offset int) ([]*database.Video, error) {
	if m.GetAllIntFunc != nil {
		return m.GetAllIntFunc(limit, offset)
	}
	if m.GetAllFunc != nil {
		return m.GetAllFunc("", "", nil)
	}
	return []*database.Video{}, nil
}

func (m *MockVideo) GetByChannel(channelID uuid.UUID, limit, offset int) ([]*database.Video, error) {
	if m.GetByChannelFunc != nil {
		return m.GetByChannelFunc(channelID, limit, offset)
	}
	return []*database.Video{}, nil
}

func (m *MockVideo) Search(query string, limit, offset int) ([]*database.Video, error) {
	if m.SearchFunc != nil {
		return m.SearchFunc(query, limit, offset)
	}
	return []*database.Video{}, nil
}

func (m *MockVideo) GetByID(id uuid.UUID) (*database.Video, error) {
	if m.GetByIDSimpleFunc != nil {
		return m.GetByIDSimpleFunc(id)
	}
	if m.GetByIDFunc != nil {
		return m.GetByIDFunc(id, nil)
	}
	return nil, nil
}

func (m *MockVideo) Delete(id uuid.UUID) error {
	if m.DeleteFunc != nil {
		return m.DeleteFunc(id)
	}
	return nil
}

func (m *MockVideo) GetLanguage(id uuid.UUID) (string, error) {
	if m.GetLanguageFunc != nil {
		return m.GetLanguageFunc(id)
	}
	return "", nil
}

func (m *MockVideo) UpdateStatus(videoId uuid.UUID, status string) error {
	if m.UpdateStatusFunc != nil {
		return m.UpdateStatusFunc(videoId, status)
	}
	return nil
}

func (m *MockVideo) UpdateLanguage(videoId uuid.UUID, lang string) error {
	if m.UpdateLanguageFunc != nil {
		return m.UpdateLanguageFunc(videoId, lang)
	}
	return nil
}

func (m *MockVideo) UpdateUpscaled(videoId uuid.UUID) error {
	if m.UpdateUpscaledFunc != nil {
		return m.UpdateUpscaledFunc(videoId)
	}
	return nil
}

func (m *MockVideo) UpdateQuality(videoId uuid.UUID, heights []int) error {
	if m.UpdateQualityHeightsFunc != nil {
		return m.UpdateQualityHeightsFunc(videoId, heights)
	}
	if m.UpdateQualityFunc != nil {
		h := 0
		if len(heights) > 0 {
			h = heights[0]
		}
		return m.UpdateQualityFunc(videoId, h)
	}
	return nil
}

func (m *MockVideo) UpdateViews(videoId uuid.UUID, views int) error {
	if m.UpdateViewsFunc != nil {
		return m.UpdateViewsFunc(videoId, views)
	}
	return nil
}

func (m *MockVideo) UpdateLikes(videoId uuid.UUID, likes int64) error {
	if m.UpdateLikesFunc != nil {
		return m.UpdateLikesFunc(videoId, likes)
	}
	return nil
}

func (m *MockVideo) UpdateDislikes(videoId uuid.UUID, dislikes int64) error {
	if m.UpdateDislikesFunc != nil {
		return m.UpdateDislikesFunc(videoId, dislikes)
	}
	return nil
}

func (m *MockVideo) UpdateLikesDislikes(videoId uuid.UUID, likes int, dislikes int) error {
	if m.UpdateLikesDislikesFunc != nil {
		return m.UpdateLikesDislikesFunc(videoId, likes, dislikes)
	}
	return nil
}

func (m *MockVideo) UpsertVideoStatsFromView(videoID uuid.UUID, watchedSeconds int) error {
	if m.UpsertVideoStatsFromViewFunc != nil {
		return m.UpsertVideoStatsFromViewFunc(videoID, watchedSeconds)
	}
	return nil
}

func (m *MockVideo) RefreshVideoStatsFromReactions(videoID uuid.UUID) error {
	if m.RefreshVideoStatsFromReactionsFn != nil {
		return m.RefreshVideoStatsFromReactionsFn(videoID)
	}
	return nil
}
