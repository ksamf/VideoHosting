package storage

import (
	"testing"

	"github.com/google/uuid"
)

func TestNormalizeEndpoint(t *testing.T) {
	tests := []struct {
		name          string
		input         string
		wantHost      string
		wantPublicURL string
		wantSecure    bool
	}{
		{
			name:          "https endpoint",
			input:         "https://s3.twcstorage.ru",
			wantHost:      "s3.twcstorage.ru",
			wantPublicURL: "https://s3.twcstorage.ru",
			wantSecure:    true,
		},
		{
			name:          "host endpoint defaults to https",
			input:         "s3.twcstorage.ru",
			wantHost:      "s3.twcstorage.ru",
			wantPublicURL: "https://s3.twcstorage.ru",
			wantSecure:    true,
		},
		{
			name:          "http endpoint stays insecure for local minio",
			input:         "http://minio:9000",
			wantHost:      "minio:9000",
			wantPublicURL: "http://minio:9000",
			wantSecure:    false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := normalizeEndpoint(tt.input)

			if got.host != tt.wantHost {
				t.Fatalf("host = %q, want %q", got.host, tt.wantHost)
			}
			if got.publicBaseURL != tt.wantPublicURL {
				t.Fatalf("publicBaseURL = %q, want %q", got.publicBaseURL, tt.wantPublicURL)
			}
			if got.secure != tt.wantSecure {
				t.Fatalf("secure = %t, want %t", got.secure, tt.wantSecure)
			}
		})
	}
}

func TestGetURLUsesPublicEndpointWithoutAddingScheme(t *testing.T) {
	s3 := &Storage{
		Endpoint:   "https://s3.twcstorage.ru",
		BucketName: "videos",
	}

	got := s3.GetURL(uuid.MustParse("11111111-1111-1111-1111-111111111111"), "video")
	want := "https://s3.twcstorage.ru/videos/video/11111111-1111-1111-1111-111111111111"

	if got != want {
		t.Fatalf("GetURL() = %q, want %q", got, want)
	}
}
