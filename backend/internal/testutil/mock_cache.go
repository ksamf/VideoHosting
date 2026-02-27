package testutil

import (
	"time"

	"github.com/ksamf/VideoHosting/backend/internal/interfaces"
	"github.com/redis/go-redis/v9"
)

type MockCache struct {
	SetFunc       func(key string, value any, exp time.Duration)
	GetFunc       func(key string) string
	DelFunc       func(key string)
	IncrFunc      func(key string)
	DecrFunc      func(key string)
	SAddFunc      func(key string, members ...any)
	SRemFunc      func(key string, members ...any)
	SCardFunc     func(key string) int64
	ScanFunc      func(cursor uint64, match string, count int64) *redis.ScanCmd
	SIsMemberFunc func(key string, member any) bool
	LimitFunc     func(key string, window time.Duration, maxHits int64) interfaces.RateLimitInfo
}

func (m *MockCache) Set(key string, value any, exp time.Duration) {
	if m.SetFunc != nil {
		m.SetFunc(key, value, exp)
	}
}

func (m *MockCache) Get(key string) string {
	if m.GetFunc != nil {
		return m.GetFunc(key)
	}
	return ""
}

func (m *MockCache) Incr(key string) {
	if m.IncrFunc != nil {
		m.IncrFunc(key)
	}
}

func (m *MockCache) Decr(key string) {
	if m.DecrFunc != nil {
		m.DecrFunc(key)
	}
}

func (m *MockCache) SAdd(key string, members ...any) {
	if m.SAddFunc != nil {
		m.SAddFunc(key, members...)
	}
}

func (m *MockCache) SRem(key string, members ...any) {
	if m.SRemFunc != nil {
		m.SRemFunc(key, members...)
	}
}

func (m *MockCache) Del(key string) {
	if m.DelFunc != nil {
		m.DelFunc(key)
	}
}

func (m *MockCache) SCard(key string) int64 {
	if m.SCardFunc != nil {
		return m.SCardFunc(key)
	}
	return 0
}

func (m *MockCache) Scan(cursor uint64, match string, count int64) *redis.ScanCmd {
	if m.ScanFunc != nil {
		return m.ScanFunc(cursor, match, count)
	}
	return nil
}

func (m *MockCache) SIsMember(key string, member any) bool {
	if m.SIsMemberFunc != nil {
		return m.SIsMemberFunc(key, member)
	}
	return false
}

func (m *MockCache) Limit(key string, window time.Duration, maxHits int64) interfaces.RateLimitInfo {
	if m.LimitFunc != nil {
		return m.LimitFunc(key, window, maxHits)
	}
	return interfaces.RateLimitInfo{
		RateLimited: false,
		ResetTime:   time.Now().Add(window),
		Remaining:   maxHits,
	}
}
