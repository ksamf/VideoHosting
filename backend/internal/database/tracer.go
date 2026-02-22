package database

import (
	"context"
	"log"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
)

type slowQueryTracer struct {
	threshold time.Duration
}

type queryStartKey struct{}

type queryStartMeta struct {
	start time.Time
	sql   string
}

func newSlowQueryTracer(threshold time.Duration) *slowQueryTracer {
	return &slowQueryTracer{threshold: threshold}
}

func (t *slowQueryTracer) TraceQueryStart(ctx context.Context, _ *pgx.Conn, data pgx.TraceQueryStartData) context.Context {
	return context.WithValue(ctx, queryStartKey{}, queryStartMeta{
		start: time.Now(),
		sql:   normalizeSQL(data.SQL),
	})
}

func (t *slowQueryTracer) TraceQueryEnd(ctx context.Context, _ *pgx.Conn, data pgx.TraceQueryEndData) {
	meta, ok := ctx.Value(queryStartKey{}).(queryStartMeta)
	if !ok {
		return
	}

	elapsed := time.Since(meta.start)
	if elapsed >= t.threshold {
		log.Printf("slow query elapsed=%s sql=%q err=%v", elapsed, meta.sql, data.Err)
	}
}

func normalizeSQL(sql string) string {
	parts := strings.Fields(sql)
	if len(parts) == 0 {
		return ""
	}
	return strings.Join(parts, " ")
}

