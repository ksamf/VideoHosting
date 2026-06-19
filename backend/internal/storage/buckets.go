package storage

import (
	"context"
	"log"

	"github.com/ksamf/VideoHosting/backend/internal/config"
	"github.com/minio/minio-go/v7"
)

func NewBucket(conn *minio.Client, conf *config.Config) *Storage {
	endpoint := normalizeEndpoint(conf.S3.EndpointURL)
	storage := &Storage{
		Endpoint:        endpoint.publicBaseURL,
		AccessKeyID:     conf.S3.AccessKeyID,
		SecretAccessKey: conf.S3.SecretAccessKey,
		BucketName:      conf.S3.BucketName,
		Client:          conn,
	}
	err := conn.MakeBucket(context.Background(), storage.BucketName, minio.MakeBucketOptions{})
	if err != nil {
		exists, errBucketExists := conn.BucketExists(context.Background(), storage.BucketName)
		if errBucketExists == nil && exists {
			log.Printf("We already own %s\n", storage.BucketName)
		} else {
			log.Fatalln(err)
		}
	} else {
		log.Printf("Successfully created %s\n", storage.BucketName)
	}
	return storage
}
