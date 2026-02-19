package handler

import (
	"github.com/ksamf/VideoHosting/backend/internal/config"
	"github.com/ksamf/VideoHosting/backend/internal/database"
	"github.com/ksamf/VideoHosting/backend/internal/interfaces"
)

type Handlers struct {
	Video  *VideoHandler
	User   *UserHandler
	Action *ActionHandler
}

func NewUserHandlers(user interfaces.User, action interfaces.Action, s3 interfaces.ObjectStorage, redis interfaces.Cache, kafka interfaces.MessageBroker) *UserHandler {
	return &UserHandler{
		user:   user,
		action: action,
		s3:     s3,
		redis:  redis,
		kafka:  kafka,
	}
}
func NewVideoHandlers(video interfaces.Video, action interfaces.Action, user interfaces.User, conf *config.Config, s3 interfaces.ObjectStorage, redis interfaces.Cache, kafka interfaces.MessageBroker) *VideoHandler {
	return &VideoHandler{
		video:  video,
		action: action,
		user:   user,
		config: conf,
		s3:     s3,
		redis:  redis,
		kafka:  kafka,
	}
}
func NewActionHandlers(action interfaces.Action, redis interfaces.Cache, kafka interfaces.MessageBroker) *ActionHandler {
	return &ActionHandler{
		action: action,
		redis:  redis,
		kafka:  kafka,
	}
}

func NewHandlers(models database.Models, conf *config.Config, s3 interfaces.ObjectStorage, redis interfaces.Cache, kafka interfaces.MessageBroker) *Handlers {
	userHandler := NewUserHandlers(&models.Users, &models.Actions, s3, redis, kafka)
	videoHandler := NewVideoHandlers(&models.Videos, &models.Actions, &models.Users, conf, s3, redis, kafka)
	actionHandler := NewActionHandlers(&models.Actions, redis, kafka)
	return &Handlers{
		videoHandler,
		userHandler,
		actionHandler,
	}
}
