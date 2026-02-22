package database

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/ksamf/VideoHosting/backend/internal/config"
)

func New(conf *config.Config) *pgxpool.Pool {
	url := fmt.Sprintf("postgres://%s:%s@%s:%d/%s?sslmode=disable",
		conf.Postgres.User,
		conf.Postgres.Pass,
		conf.Postgres.Host,
		conf.Postgres.Port,
		conf.Postgres.Name)
	cfg, err := pgxpool.ParseConfig(url)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to connect to database: %v\n", err)
		os.Exit(1)
	}
	cfg.MaxConns = 30
	cfg.MinConns = 10
	cfg.MaxConnLifetime = 30 * time.Minute
	cfg.MaxConnIdleTime = 10 * time.Minute
	cfg.HealthCheckPeriod = 30 * time.Second
	cfg.ConnConfig.Tracer = newSlowQueryTracer(500 * time.Millisecond)
	pool, err := pgxpool.NewWithConfig(context.Background(), cfg)
	if err != nil {
		fmt.Fprintf(os.Stderr, "unable to connect to db: %v\n", err)
		os.Exit(1)
	}

	log.Printf("db pool started max=%d min=%d", cfg.MaxConns, cfg.MinConns)
	return pool
}
