package testutil

import (
	"github.com/google/uuid"
	"github.com/ksamf/VideoHosting/backend/internal/database"
)

type MockAction struct {
	InsertFunc       func(userId, videoId uuid.UUID) error
	GetFunc          func(userId, videoId uuid.UUID) (*database.Action, error)
	UpdateReactionFn func(userId, videoId uuid.UUID, reaction string) error
	ClearReactionFn  func(userId, videoId uuid.UUID) error
	GetCommentsFn    func(videoId uuid.UUID) ([]*database.Comment, error)
	AddCommentFn     func(commentId, userId, videoId uuid.UUID, comment string) error
	CountReactionsFn func(videoId uuid.UUID) (int, int, error)
	SubUnsubFn       func(userId, channelId uuid.UUID, action string) error
	GetWatchedFn     func(userId uuid.UUID) ([]*database.Video, error)
	GetLikedFn       func(userId uuid.UUID) ([]*database.Video, error)
	UpdateViewFn     func(userId, videoId uuid.UUID, view int) error
	GetVideoViewsFn  func(videoId uuid.UUID) (int, error)
}

func (m *MockAction) Insert(userId, videoId uuid.UUID) error {
	if m.InsertFunc != nil {
		return m.InsertFunc(userId, videoId)
	}
	return nil
}

func (m *MockAction) Get(userId, videoId uuid.UUID) (*database.Action, error) {
	if m.GetFunc != nil {
		return m.GetFunc(userId, videoId)
	}
	return &database.Action{}, nil
}

func (m *MockAction) UpdateReaction(userId, videoId uuid.UUID, reaction string) error {
	if m.UpdateReactionFn != nil {
		return m.UpdateReactionFn(userId, videoId, reaction)
	}
	return nil
}

func (m *MockAction) ClearReaction(userId, videoId uuid.UUID) error {
	if m.ClearReactionFn != nil {
		return m.ClearReactionFn(userId, videoId)
	}
	return nil
}

func (m *MockAction) GetComments(videoId uuid.UUID) ([]*database.Comment, error) {
	if m.GetCommentsFn != nil {
		return m.GetCommentsFn(videoId)
	}
	return []*database.Comment{}, nil
}

func (m *MockAction) AddComment(commentId, userId, videoId uuid.UUID, comment string) error {
	if m.AddCommentFn != nil {
		return m.AddCommentFn(commentId, userId, videoId, comment)
	}
	return nil
}

func (m *MockAction) CountReactions(videoId uuid.UUID) (int, int, error) {
	if m.CountReactionsFn != nil {
		return m.CountReactionsFn(videoId)
	}
	return 0, 0, nil
}

func (m *MockAction) SubUnsub(userId, channelId uuid.UUID, action string) error {
	if m.SubUnsubFn != nil {
		return m.SubUnsubFn(userId, channelId, action)
	}
	return nil
}

func (m *MockAction) GetWatchedVideo(userId uuid.UUID) ([]*database.Video, error) {
	if m.GetWatchedFn != nil {
		return m.GetWatchedFn(userId)
	}
	return []*database.Video{}, nil
}

func (m *MockAction) GetLikedVideo(userId uuid.UUID) ([]*database.Video, error) {
	if m.GetLikedFn != nil {
		return m.GetLikedFn(userId)
	}
	return []*database.Video{}, nil
}

func (m *MockAction) UpdateView(userId, videoId uuid.UUID, view int) error {
	if m.UpdateViewFn != nil {
		return m.UpdateViewFn(userId, videoId, view)
	}
	return nil
}

func (m *MockAction) GetVideoViews(videoId uuid.UUID) (int, error) {
	if m.GetVideoViewsFn != nil {
		return m.GetVideoViewsFn(videoId)
	}
	return 0, nil
}
