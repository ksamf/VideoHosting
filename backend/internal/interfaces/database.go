package interfaces

import (
	"github.com/google/uuid"
	"github.com/ksamf/VideoHosting/backend/internal/database"
)

type User interface {
	Insert(userId uuid.UUID, username, email, hash string) error
	GetByEmail(email string) (*database.User, error)
	GetByID(id uuid.UUID) (*database.User, error)
	Delete(id uuid.UUID) error
	GetByVideoId(id uuid.UUID) (*database.User, error)
	SearchChannels(query string, limit, offset int) ([]*database.User, error)
	UpdateAvatar(userId uuid.UUID, avatar_url string) error
	GetSubscriptionsCount(channelId uuid.UUID, period int) (int, error)
	GetSubscriptionsVideo(userId uuid.UUID, limit, offset int) ([]*database.Video, error)
	GetSubscriptions(userId uuid.UUID) ([]*database.User, error)
	Videos(userId uuid.UUID) ([]*database.Video, error)
	GetViewsCount(channelId uuid.UUID, periodDays int) (int, error)
	UpdateSubscriptions(userId uuid.UUID, subs int) error
	GetSubscribed(userId, channelId uuid.UUID) (bool, error)
	GetRecommendations(userID uuid.UUID, limit, offset int) ([]*database.Video, error)
	UpsertAuthorAffinityFromSubscribe(userID, channelID uuid.UUID, action string) error
	UpsertAffinitiesFromView(userID, videoID uuid.UUID, watchedSeconds int) error
	RecordPersonalDataConsent(userId uuid.UUID, version, ip string) error
}
type Video interface {
	Insert(video *database.Video) error
	GetAll(limit, offset int) ([]*database.Video, error)
	GetByChannel(channelID uuid.UUID, limit, offset int) ([]*database.Video, error)
	Search(query string, limit, offset int) ([]*database.Video, error)
	GetByID(id uuid.UUID) (*database.Video, error)
	Delete(id uuid.UUID) error
	GetLanguage(id uuid.UUID) (string, error)
	UpdateStatus(videoId uuid.UUID, status string) error
	UpdateLanguage(videoId uuid.UUID, lang string) error
	UpdateUpscaled(videoId uuid.UUID) error
	UpdateQuality(videoId uuid.UUID, heights []int) error
	UpdateViews(videoId uuid.UUID, views int) error
	UpdateLikes(videoId uuid.UUID, likes int64) error
	UpdateDislikes(videoId uuid.UUID, dislikes int64) error
	UpdateLikesDislikes(videoId uuid.UUID, likes int, dislikes int) error
	UpsertVideoStatsFromView(videoID uuid.UUID, watchedSeconds int) error
	RefreshVideoStatsFromReactions(videoID uuid.UUID) error
}
type Action interface {
	Insert(userId, videoId uuid.UUID) error
	Get(userId, videoId uuid.UUID) (*database.Action, error)
	UpdateReaction(userId, videoId uuid.UUID, reaction string) error
	ClearReaction(userId, videoId uuid.UUID) error
	GetComments(videoId uuid.UUID, limit, offset int) ([]*database.Comment, error)
	AddComment(commentId, userId, videoId uuid.UUID, comment string) error
	CountReactions(videoId uuid.UUID) (int, int, error)
	SubUnsub(userId, channelId uuid.UUID, action string) error
	GetWatchedVideo(userId uuid.UUID, limit, offset int) ([]*database.Video, error)
	GetLikedVideo(userId uuid.UUID, limit, offset int) ([]*database.Video, error)
	UpdateView(userId, videoId uuid.UUID, view int) error
	GetVideoViews(videoId uuid.UUID) (int, error)
}
