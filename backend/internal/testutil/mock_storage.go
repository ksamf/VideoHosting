package testutil

import (
	"context"
	"io"

	"github.com/google/uuid"
)

type MockStorage struct {
	PutObjectFunc    func(fileName string, file io.Reader) error
	PutObjectWithContextFunc func(ctx context.Context, fileName string, file io.Reader, contentType string) error
	GetObjectFunc    func(object, tmpPath string) error
	DeleteObjectFunc func(object string) error
	ExitsObjectsFunc func(object string) bool
	GetURLFunc       func(id uuid.UUID) string
	GetURLWithFolderFunc func(id uuid.UUID, folder string) string
}

func (s3 *MockStorage) PutObject(ctx context.Context, fileName string, file io.Reader, contentType string) error {
	if s3.PutObjectWithContextFunc != nil {
		return s3.PutObjectWithContextFunc(ctx, fileName, file, contentType)
	}
	if s3.PutObjectFunc != nil {
		return s3.PutObjectFunc(fileName, file)
	}
	return nil
}

func (s3 *MockStorage) GetObject(object, tmpPath string) error {
	if s3.GetObjectFunc != nil {
		return s3.GetObjectFunc(object, tmpPath)
	}
	return nil
}

func (s3 *MockStorage) DeleteObject(object string) error {
	if s3.DeleteObjectFunc != nil {
		return s3.DeleteObjectFunc(object)
	}
	return nil
}

func (s3 *MockStorage) ExitsObjects(object string) bool {
	if s3.ExitsObjectsFunc != nil {
		return s3.ExitsObjectsFunc(object)
	}
	return false
}

func (s3 *MockStorage) GetURL(id uuid.UUID, folder string) string {
	if s3.GetURLWithFolderFunc != nil {
		return s3.GetURLWithFolderFunc(id, folder)
	}
	if s3.GetURLFunc != nil {
		return s3.GetURLFunc(id)
	}
	return ""
}
