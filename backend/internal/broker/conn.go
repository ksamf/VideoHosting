package broker

import (
	"fmt"
	"log"

	"github.com/google/uuid"
	"github.com/ksamf/VideoHosting/backend/internal/config"
	"github.com/segmentio/kafka-go"
)

type Client struct {
	Writer          *kafka.Writer
	ReaderProcessor *kafka.Reader
	ReaderSubtitle  *kafka.Reader
	ReaderUpscale   *kafka.Reader
	ReaderAvatar    *kafka.Reader
	ReaderReaction  *kafka.Reader
	ReaderSubscribe *kafka.Reader
	ReaderView      *kafka.Reader
}
type VideoProcessor struct {
	VideoID uuid.UUID `json:"video_id"`
	FileExt string    `json:"file_ext"`
	Done    bool      `json:"done"`
}

type VideoUpscale struct {
	VideoID   uuid.UUID `json:"video_id"`
	Quality   int       `json:"quality"`
	Realistic bool      `json:"realistic"`
	Done      bool      `json:"done"`
}

type VideoSubtitle struct {
	VideoID  uuid.UUID `json:"video_id"`
	Language string    `json:"language"`
	Done     bool      `json:"done"`
}

type UserAvatar struct {
	UserId  uuid.UUID `json:"user_id"`
	FileExt string    `json:"file_ext"`
}

type Reaction struct {
	VideoID  uuid.UUID `json:"video_id"`
	UserID   uuid.UUID `json:"user_id"`
	Reaction string    `json:"reaction"`
}

type Subscribe struct {
	UserID    uuid.UUID `json:"user_id"`
	ChannelID uuid.UUID `json:"channel_id"`
	Action    string    `json:"action"`
}

type View struct {
	UserId         uuid.UUID `json:"user_id,omitempty"`
	VideoId        uuid.UUID `json:"video_id"`
	DeviceId       uuid.UUID `json:"device_id"`
	IsAnon         bool      `json:"is_anon"`
	WatchedSeconds int       `json:"watched_seconds"`
}

func New(conf *config.Config) *Client {
	group := "video"
	broker := fmt.Sprintf("%s:%d", conf.Kafka.Host, conf.Kafka.Port)

	conn, err := kafka.Dial("tcp", broker)
	if err != nil {
		log.Fatalf("failed to connect to Kafka broker: %v", err)
	}
	defer conn.Close()

	topics := []string{
		"video_processor",
		"video_subtitle",
		"video_upscale",
		"user_avatar",
		"reaction",
		"subscribe",
		"view",
	}
	cfgs := make([]kafka.TopicConfig, 0, len(topics))
	for _, t := range topics {
		cfgs = append(cfgs, kafka.TopicConfig{
			Topic:             t,
			NumPartitions:     1,
			ReplicationFactor: 1,
		})
	}

	if err := conn.CreateTopics(cfgs...); err != nil {
		log.Fatalf("failed to create topics: %v", err)
	}

	writer := &kafka.Writer{
		Addr:     kafka.TCP(broker),
		Balancer: &kafka.LeastBytes{},
	}

	newReader := func(topic string) *kafka.Reader {
		return kafka.NewReader(kafka.ReaderConfig{
			Brokers:  []string{broker},
			GroupID:  group,
			Topic:    topic,
			MinBytes: 1,
			MaxBytes: 10e6,
		})
	}

	return &Client{
		Writer:          writer,
		ReaderProcessor: newReader("video_processor"),
		ReaderSubtitle:  newReader("video_subtitle"),
		ReaderUpscale:   newReader("video_upscale"),
		ReaderAvatar:    newReader("user_avatar"),
		ReaderReaction:  newReader("reaction"),
		ReaderSubscribe: newReader("subscribe"),
		ReaderView:      newReader("view"),
	}
}
