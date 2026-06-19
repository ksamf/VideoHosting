package storage

import (
	"log"
	"net/url"
	"strings"

	"github.com/ksamf/VideoHosting/backend/internal/config"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type endpointConfig struct {
	host          string
	publicBaseURL string
	secure        bool
}

func normalizeEndpoint(raw string) endpointConfig {
	endpoint := strings.TrimRight(strings.TrimSpace(raw), "/")
	if !strings.Contains(endpoint, "://") {
		return endpointConfig{
			host:          endpoint,
			publicBaseURL: "https://" + endpoint,
			secure:        true,
		}
	}

	parsed, err := url.Parse(endpoint)
	if err != nil || parsed.Host == "" {
		return endpointConfig{
			host:          endpoint,
			publicBaseURL: endpoint,
			secure:        true,
		}
	}

	return endpointConfig{
		host:          parsed.Host,
		publicBaseURL: parsed.Scheme + "://" + parsed.Host,
		secure:        parsed.Scheme == "https",
	}
}

func New(conf *config.Config) *minio.Client {
	endpoint := normalizeEndpoint(conf.S3.EndpointURL)
	conn, err := minio.New(endpoint.host, &minio.Options{
		Creds:  credentials.NewStaticV4(conf.S3.AccessKeyID, conf.S3.SecretAccessKey, ""),
		Secure: endpoint.secure,
	})
	if err != nil {
		log.Fatalln(err)
	}

	return conn
}
