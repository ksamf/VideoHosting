package broker

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/segmentio/kafka-go"
)

type KafkaMessage interface{}

func (c *Client) writeGeneric(topic string, key []byte, v any) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	value, err := json.Marshal(v)
	if err != nil {
		return fmt.Errorf("failed to marshal: %w", err)
	}
	kmsg := kafka.Message{
		Topic: topic,
		Key:   key,
		Value: value,
	}
	if err := c.Writer.WriteMessages(ctx, kmsg); err != nil {
		return fmt.Errorf("failed to write message to Kafka: %w", err)
	}
	return nil
}

func (c *Client) WriteVideo(msg *VideoProcessor) error {
	return c.writeGeneric("video_processor", []byte(msg.VideoID.String()), msg)
}
func (c *Client) WriteAvatar(msg *UserAvatar) error {
	return c.writeGeneric("user_avatar", []byte(msg.UserId.String()), msg)
}
func (c *Client) WriteReaction(msg *Reaction) error {
	key := []byte(fmt.Sprintf("%s_%s", msg.VideoID.String(), msg.UserID.String()))
	return c.writeGeneric("reaction", key, msg)
}
func (c *Client) WriteSubscribe(msg *Subscribe) error {
	key := []byte(fmt.Sprintf("%s_%s", msg.UserID.String(), msg.ChannelID.String()))
	return c.writeGeneric("subscribe", key, msg)
}
func (c *Client) WriteView(msg *View) error {
	var key string
	if msg.UserId != uuid.Nil {
		key = fmt.Sprintf("u:%s_v:%s", msg.UserId, msg.VideoId)
	} else {
		key = fmt.Sprintf("d:%s_v:%s", msg.DeviceId, msg.VideoId)
	}
	kmsg := []byte(key)
	return c.writeGeneric("view", kmsg, msg)
}
