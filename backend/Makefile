include .env.dev
DB_URL=postgres://$(DB_USER):$(DB_PASS)@$(DB_HOST):$(DB_PORT)/$(DB_NAME)?sslmode=disable
PPROF_URL?=http://localhost:8000/debug/pprof
PPROF_SECONDS?=60
PPROF_HTTP?=:8081
CPU_FILE?=cpu.pb
HEAP_FILE?=heap.pb
GOROUTINE_FILE?=goroutine.pb
BLOCK_FILE?=block.pb
MUTEX_FILE?=mutex.pb
FILE?=cpu.pb
BASE?=cpu_before.pb
NEW?=cpu.pb

.PHONY: all run create_migration migrate_up migrate_down migrate_force add_all add_air add_migrate pprof_cpu pprof_heap pprof_goroutine pprof_block pprof_mutex pprof_all pprof_top pprof_web pprof_diff

all:
	make migrate_up && air

run:
	air

add_all:
	make add_air
	make add_migrate

add_air:
	go install github.com/air-verse/air@latest

add_migrate:
	go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

create_migration:
	migrate create -ext sql -dir migrations $(name)

migrate_up:
	migrate -path migrations -database $(DB_URL) up

migrate_down:
	migrate -path migrations -database $(DB_URL) down 1

migrate_force:
	migrate -path migrations -database $(DB_URL) force $(version)

pprof_cpu:
	go tool pprof -proto "$(PPROF_URL)/profile?seconds=$(PPROF_SECONDS)" > "$(CPU_FILE)"

pprof_heap:
	go tool pprof -proto "$(PPROF_URL)/heap" > "$(HEAP_FILE)"

pprof_goroutine:
	go tool pprof -proto "$(PPROF_URL)/goroutine" > "$(GOROUTINE_FILE)"

pprof_block:
	go tool pprof -proto "$(PPROF_URL)/block" > "$(BLOCK_FILE)"

pprof_mutex:
	go tool pprof -proto "$(PPROF_URL)/mutex" > "$(MUTEX_FILE)"

pprof_all: pprof_cpu pprof_heap pprof_goroutine pprof_block pprof_mutex

pprof_top:
	go tool pprof -top "$(FILE)"

pprof_web:
	go tool pprof -http=$(PPROF_HTTP) "$(FILE)"

pprof_diff:
	go tool pprof -top -base "$(BASE)" "$(NEW)"
