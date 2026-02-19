package testutil

import "github.com/ksamf/VideoHosting/backend/internal/broker"

type MockBroker struct {
	WriteFunc          func(msg broker.KafkaMessage) error
	WriteVideoFunc     func(msg *broker.VideoProcessor) error
	WriteAvatarFunc    func(msg *broker.UserAvatar) error
	WriteReactionFunc  func(msg *broker.Reaction) error
	WriteSubscribeFunc func(msg *broker.Subscribe) error
	WriteViewFunc      func(msg *broker.View) error
	ReadProcessorFunc  func() (*broker.VideoProcessor, error)
	ReadUpscaleFunc    func() (*broker.VideoUpscale, error)
	ReadSubtitleFunc   func() (*broker.VideoSubtitle, error)
	ReadAvatarFunc     func() (*broker.UserAvatar, error)
	ReadReactionFunc   func() (*broker.Reaction, error)
	ReadSubscribeFunc  func() (*broker.Subscribe, error)
	ReadViewFunc       func() (*broker.View, error)
}

func (m *MockBroker) Write(msg broker.KafkaMessage) error {
	if m.WriteFunc != nil {
		return m.WriteFunc(msg)
	}
	return nil
}

func (m *MockBroker) WriteVideo(msg *broker.VideoProcessor) error {
	if m.WriteVideoFunc != nil {
		return m.WriteVideoFunc(msg)
	}
	return nil
}

func (m *MockBroker) WriteAvatar(msg *broker.UserAvatar) error {
	if m.WriteAvatarFunc != nil {
		return m.WriteAvatarFunc(msg)
	}
	return nil
}

func (m *MockBroker) WriteReaction(msg *broker.Reaction) error {
	if m.WriteReactionFunc != nil {
		return m.WriteReactionFunc(msg)
	}
	return nil
}

func (m *MockBroker) WriteSubscribe(msg *broker.Subscribe) error {
	if m.WriteSubscribeFunc != nil {
		return m.WriteSubscribeFunc(msg)
	}
	return nil
}

func (m *MockBroker) WriteView(msg *broker.View) error {
	if m.WriteViewFunc != nil {
		return m.WriteViewFunc(msg)
	}
	return nil
}

func (m *MockBroker) ReadProcessor() (*broker.VideoProcessor, error) {
	if m.ReadProcessorFunc != nil {
		return m.ReadProcessorFunc()
	}
	return nil, nil
}

func (m *MockBroker) ReadUpscale() (*broker.VideoUpscale, error) {
	if m.ReadUpscaleFunc != nil {
		return m.ReadUpscaleFunc()
	}
	return nil, nil
}

func (m *MockBroker) ReadSubtitle() (*broker.VideoSubtitle, error) {
	if m.ReadSubtitleFunc != nil {
		return m.ReadSubtitleFunc()
	}
	return nil, nil
}

func (m *MockBroker) ReadAvatar() (*broker.UserAvatar, error) {
	if m.ReadAvatarFunc != nil {
		return m.ReadAvatarFunc()
	}
	return nil, nil
}

func (m *MockBroker) ReadReaction() (*broker.Reaction, error) {
	if m.ReadReactionFunc != nil {
		return m.ReadReactionFunc()
	}
	return nil, nil
}

func (m *MockBroker) ReadSubscribe() (*broker.Subscribe, error) {
	if m.ReadSubscribeFunc != nil {
		return m.ReadSubscribeFunc()
	}
	return nil, nil
}

func (m *MockBroker) ReadView() (*broker.View, error) {
	if m.ReadViewFunc != nil {
		return m.ReadViewFunc()
	}
	return nil, nil
}
