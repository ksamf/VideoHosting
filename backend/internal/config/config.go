package config

import (
	"os"
	"strconv"
	"strings"
)

type AppConfig struct {
	Host        string
	Port        int
	Mode        string
	CorsOrigins []string
}

type RateLimitConfig struct {
	AuthPerMinute   int64
	SearchPerMinute int64
	WritePerMinute  int64
	ViewsPerMinute  int64
}

type UploadConfig struct {
	VideoMaxBytes  int64
	AvatarMaxBytes int64
}

type JwtConfig struct {
	Key string
}
type PgConfig struct {
	Host string
	Port int
	User string
	Pass string
	Name string
}

type RedisConfig struct {
	Host string
	Port int
	Pass string
}
type S3Config struct {
	AccessKeyID     string
	SecretAccessKey string
	EndpointURL     string
	BucketName      string
}

type ApiConfig struct {
	BaseURL string
}

type KafkaConfig struct {
	Host string
	Port int
}
type Config struct {
	App      AppConfig
	Rate     RateLimitConfig
	Upload   UploadConfig
	Jwt      JwtConfig
	Postgres PgConfig
	Redis    RedisConfig
	S3       S3Config
	Api      ApiConfig
	Kafka    KafkaConfig
}

func New() *Config {

	return &Config{
		App: AppConfig{
			Host:        getEnv("APP_HOST", "localhost"),
			Port:        getEnvAsInt("APP_PORT", 8000),
			Mode:        getEnv("APP_MODE", "release"),
			CorsOrigins: getCSVEnv("CORS_ORIGINS"),
		},
		Rate: RateLimitConfig{
			AuthPerMinute:   getEnvAsInt64("RATE_AUTH_PER_MIN", 10),
			SearchPerMinute: getEnvAsInt64("RATE_SEARCH_PER_MIN", 120),
			WritePerMinute:  getEnvAsInt64("RATE_WRITE_PER_MIN", 30),
			ViewsPerMinute:  getEnvAsInt64("RATE_VIEWS_PER_MIN", 180),
		},
		Upload: UploadConfig{
			VideoMaxBytes:  getEnvAsInt64("UPLOAD_VIDEO_MAX_BYTES", 200<<20), // 200MB
			AvatarMaxBytes: getEnvAsInt64("UPLOAD_AVATAR_MAX_BYTES", 5<<20),  // 5MB
		},
		Jwt: JwtConfig{
			Key: getEnv("SECRET_KEY", ""),
		},
		Postgres: PgConfig{
			Host: getEnv("DB_HOST", ""),
			Port: getEnvAsInt("DB_PORT", 5432),
			User: getEnv("DB_USER", ""),
			Pass: getEnv("DB_PASS", ""),
			Name: getEnv("DB_NAME", ""),
		},
		Redis: RedisConfig{
			Host: getEnv("REDIS_HOST", "localhost"),
			Port: getEnvAsInt("REDIS_PORT", 6379),
			Pass: getEnv("REDIS_PASS", ""),
		},
		S3: S3Config{
			AccessKeyID:     getEnv("S3_ACCESS_KEY_ID", ""),
			SecretAccessKey: getEnv("S3_SECRET_ACCESS_KEY", ""),
			EndpointURL:     getEnv("S3_ENDPOINT_URL", ""),
			BucketName:      getEnv("S3_BUCKET_NAME", ""),
		},
		Api: ApiConfig{
			BaseURL: getEnv("BASE_URL", ""),
		},
		Kafka: KafkaConfig{
			Host: getEnv("KAFKA_HOST", "localhost"),
			Port: getEnvAsInt("KAFKA_PORT", 9092),
		},
	}
}

func getEnv(key, defaultVal string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultVal
}
func getEnvAsInt(key string, defaultVal int) int {
	valueStr := getEnv(key, "")
	if value, err := strconv.Atoi(valueStr); err == nil {
		return value
	}
	return defaultVal
}

func getEnvAsInt64(key string, defaultVal int64) int64 {
	valueStr := getEnv(key, "")
	if value, err := strconv.ParseInt(valueStr, 10, 64); err == nil {
		return value
	}
	return defaultVal
}

func getCSVEnv(key string) []string {
	value := strings.TrimSpace(getEnv(key, ""))
	if value == "" {
		return []string{}
	}

	parts := strings.Split(value, ",")
	out := make([]string, 0, len(parts))
	for _, part := range parts {
		item := strings.TrimSpace(part)
		if item != "" {
			out = append(out, item)
		}
	}
	return out
}
