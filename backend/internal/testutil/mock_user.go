package testutil

import (
	"github.com/google/uuid"
	"github.com/ksamf/VideoHosting/backend/internal/database"
)

type MockUser struct {
	InsertFunc                    func(userId uuid.UUID, username, email, password string) error
	GetByEmailFunc                func(email string) (*database.User, error)
	GetByIDFunc                   func(id uuid.UUID) (*database.User, error)
	GetByIdFunc                   func(id uuid.UUID) (*database.User, error)
	SearchChannelsFunc            func(query string, limit, offset int) ([]*database.User, error)
	DeleteFunc                    func(id uuid.UUID) error
	GetByVideoIdFunc              func(id uuid.UUID) (*database.User, error)
	UpdateAvatarFunc              func(userId uuid.UUID, avatarURL string) error
	GetSubscriptionsCountFunc     func(channelId uuid.UUID, period int) (int, error)
	GetSubscriptionsVideoFunc     func(userId uuid.UUID, limit, offset int) ([]*database.Video, error)
	GetSubscriptionsFunc          func(userId uuid.UUID) ([]*database.User, error)
	VideosFunc                    func(userId uuid.UUID) ([]*database.Video, error)
	VideosWithURLFunc             func(userId uuid.UUID, getURL func(uuid.UUID) string) ([]*database.Video, error)
	GetViewsCountFunc             func(channelId uuid.UUID, periodDays int) (int, error)
	UpdateSubscriptionsFunc       func(userId uuid.UUID, subs int) error
	GetSubscribedFunc             func(userId, channelId uuid.UUID) (bool, error)
	GetRecommendationsFunc        func(userID uuid.UUID, limit, offset int) ([]*database.Video, error)
	UpsertAuthorAffinitySubFunc   func(userID, channelID uuid.UUID, action string) error
	UpsertAffinitiesFromViewFunc  func(userID, videoID uuid.UUID, watchedSeconds int) error
	RecordPersonalDataConsentFunc func(userId uuid.UUID, version, ip string) error
}

func (m *MockUser) Insert(userId uuid.UUID, username, email, password string) error {
	if m.InsertFunc != nil {
		return m.InsertFunc(userId, username, email, password)
	}
	return nil
}

func (m *MockUser) GetByEmail(email string) (*database.User, error) {
	if m.GetByEmailFunc != nil {
		return m.GetByEmailFunc(email)
	}
	return nil, nil
}

func (m *MockUser) GetByID(id uuid.UUID) (*database.User, error) {
	if m.GetByIDFunc != nil {
		return m.GetByIDFunc(id)
	}
	if m.GetByIdFunc != nil {
		return m.GetByIdFunc(id)
	}
	return nil, nil
}

func (m *MockUser) SearchChannels(query string, limit, offset int) ([]*database.User, error) {
	if m.SearchChannelsFunc != nil {
		return m.SearchChannelsFunc(query, limit, offset)
	}
	return []*database.User{}, nil
}

func (m *MockUser) Delete(id uuid.UUID) error {
	if m.DeleteFunc != nil {
		return m.DeleteFunc(id)
	}
	return nil
}

func (m *MockUser) GetByVideoId(id uuid.UUID) (*database.User, error) {
	if m.GetByVideoIdFunc != nil {
		return m.GetByVideoIdFunc(id)
	}
	return nil, nil
}

func (m *MockUser) UpdateAvatar(userId uuid.UUID, avatarURL string) error {
	if m.UpdateAvatarFunc != nil {
		return m.UpdateAvatarFunc(userId, avatarURL)
	}
	return nil
}

func (m *MockUser) GetSubscriptionsCount(channelId uuid.UUID, period int) (int, error) {
	if m.GetSubscriptionsCountFunc != nil {
		return m.GetSubscriptionsCountFunc(channelId, period)
	}
	return 0, nil
}

func (m *MockUser) GetSubscriptionsVideo(userId uuid.UUID, limit, offset int) ([]*database.Video, error) {
	if m.GetSubscriptionsVideoFunc != nil {
		return m.GetSubscriptionsVideoFunc(userId, limit, offset)
	}
	return []*database.Video{}, nil
}

func (m *MockUser) GetSubscriptions(userId uuid.UUID) ([]*database.User, error) {
	if m.GetSubscriptionsFunc != nil {
		return m.GetSubscriptionsFunc(userId)
	}
	return []*database.User{}, nil
}

func (m *MockUser) Videos(userId uuid.UUID) ([]*database.Video, error) {
	if m.VideosFunc != nil {
		return m.VideosFunc(userId)
	}
	if m.VideosWithURLFunc != nil {
		return m.VideosWithURLFunc(userId, nil)
	}
	return []*database.Video{}, nil
}

func (m *MockUser) GetViewsCount(channelId uuid.UUID, periodDays int) (int, error) {
	if m.GetViewsCountFunc != nil {
		return m.GetViewsCountFunc(channelId, periodDays)
	}
	return 0, nil
}

func (m *MockUser) UpdateSubscriptions(userId uuid.UUID, subs int) error {
	if m.UpdateSubscriptionsFunc != nil {
		return m.UpdateSubscriptionsFunc(userId, subs)
	}
	return nil
}

func (m *MockUser) GetSubscribed(userId, channelId uuid.UUID) (bool, error) {
	if m.GetSubscribedFunc != nil {
		return m.GetSubscribedFunc(userId, channelId)
	}
	return false, nil
}

func (m *MockUser) GetRecommendations(userID uuid.UUID, limit, offset int) ([]*database.Video, error) {
	if m.GetRecommendationsFunc != nil {
		return m.GetRecommendationsFunc(userID, limit, offset)
	}
	return []*database.Video{}, nil
}

func (m *MockUser) UpsertAuthorAffinityFromSubscribe(userID, channelID uuid.UUID, action string) error {
	if m.UpsertAuthorAffinitySubFunc != nil {
		return m.UpsertAuthorAffinitySubFunc(userID, channelID, action)
	}
	return nil
}

func (m *MockUser) UpsertAffinitiesFromView(userID, videoID uuid.UUID, watchedSeconds int) error {
	if m.UpsertAffinitiesFromViewFunc != nil {
		return m.UpsertAffinitiesFromViewFunc(userID, videoID, watchedSeconds)
	}
	return nil
}

func (m *MockUser) RecordPersonalDataConsent(userId uuid.UUID, version, ip string) error {
	if m.RecordPersonalDataConsentFunc != nil {
		return m.RecordPersonalDataConsentFunc(userId, version, ip)
	}
	return nil
}
