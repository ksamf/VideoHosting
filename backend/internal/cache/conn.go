package cache

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/ksamf/VideoHosting/backend/internal/config"
	"github.com/redis/go-redis/v9"
)

func New(conf *config.Config) *RedisModel {
	conn := redis.NewClient(&redis.Options{
		Addr:            conf.Redis.Host + ":" + fmt.Sprintf("%d", conf.Redis.Port),
		Password:        conf.Redis.Pass,
		DB:              0,
		DialTimeout:     time.Second * 2,
		ReadTimeout:     time.Second * 2,
		WriteTimeout:    time.Second * 2,
		PoolTimeout:     time.Second * 2,
		PoolSize:        50,
		MinIdleConns:    10,
		MaxRetries:      1,
		ConnMaxIdleTime: 5 * time.Minute,
		MinRetryBackoff: time.Millisecond * 5,
	})
	_, err := conn.Ping(context.Background()).Result()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to connect to redis: %v\n", err)
		os.Exit(1)
	}
	return &RedisModel{conn: conn}
}
