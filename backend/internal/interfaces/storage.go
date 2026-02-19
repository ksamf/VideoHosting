package interfaces

import (
	"context"
	"io"

	"github.com/google/uuid"
)

type ObjectStorage interface {
	PutObject(ctx context.Context, fileName string, file io.Reader, contentType string) error
	GetObject(object, tmpPath string) error
	DeleteObject(object string) error
	ExitsObjects(object string) bool
	GetURL(id uuid.UUID, folder string) string
}
