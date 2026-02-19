package broker

import (
	"context"
	"encoding/json"
	"time"

	"github.com/segmentio/kafka-go"
)

func readGeneric[T any](r *kafka.Reader) (*T, error) {

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	msg, err := r.ReadMessage(ctx)
	if err != nil {
		return nil, err
	}
	var job T
	if err := json.Unmarshal(msg.Value, &job); err != nil {
		return nil, err
	}
	return &job, nil
}

func (c *Client) ReadProcessor() (*VideoProcessor, error) {
	return readGeneric[VideoProcessor](c.ReaderProcessor)
}
func (c *Client) ReadUpscale() (*VideoUpscale, error) {
	return readGeneric[VideoUpscale](c.ReaderUpscale)
}
func (c *Client) ReadSubtitle() (*VideoSubtitle, error) {
	return readGeneric[VideoSubtitle](c.ReaderSubtitle)
}
func (c *Client) ReadAvatar() (*UserAvatar, error) {
	return readGeneric[UserAvatar](c.ReaderAvatar)
}
func (c *Client) ReadReaction() (*Reaction, error) {
	return readGeneric[Reaction](c.ReaderReaction)
}
func (c *Client) ReadSubscribe() (*Subscribe, error) {
	return readGeneric[Subscribe](c.ReaderSubscribe)
}
func (c *Client) ReadView() (*View, error) {
	return readGeneric[View](c.ReaderView)
}
