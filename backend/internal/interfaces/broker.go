package interfaces

import "github.com/ksamf/VideoHosting/backend/internal/broker"

type MessageBroker interface {
	WriteVideo(msg *broker.VideoProcessor) error
	WriteAvatar(msg *broker.UserAvatar) error
	WriteReaction(msg *broker.Reaction) error
	WriteSubscribe(msg *broker.Subscribe) error
	WriteView(msg *broker.View) error
	ReadProcessor() (*broker.VideoProcessor, error)
	ReadUpscale() (*broker.VideoUpscale, error)
	ReadSubtitle() (*broker.VideoSubtitle, error)
	ReadAvatar() (*broker.UserAvatar, error)
	ReadReaction() (*broker.Reaction, error)
	ReadSubscribe() (*broker.Subscribe, error)
	ReadView() (*broker.View, error)
}
