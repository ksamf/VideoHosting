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

SEED_API?=http://localhost:8080/api
SEED_USERS?=5
SEED_VIDEOS?=3
SEED_DIR?=
SEED_PREVIEW_DIR?=
SEED_AVATAR_DIR?=
SEED_PASSWORD?=Qwerty123!
SEED_PREFIX?=seed_user
SEED_TITLE_TEMPLATE?=seed_u{u}_v{v}
SEED_DESCRIPTION_TEMPLATE?=seed upload user={u} video={v}
SEED_TAGS?=seed,u{u},v{v}
SEED_GENERATED_DURATIONS?=3,15,45,90
SEED_TEST_CASES?=

SEED_DIR_ARG=$(if $(SEED_DIR),--dir "$(SEED_DIR)",)
SEED_PREVIEW_DIR_ARG=$(if $(SEED_PREVIEW_DIR),--preview-dir "$(SEED_PREVIEW_DIR)",)
SEED_AVATAR_DIR_ARG=$(if $(SEED_AVATAR_DIR),--avatar-dir "$(SEED_AVATAR_DIR)",)

.PHONY: all run create_migration migrate_up migrate_down migrate_force add_all add_air add_migrate pprof_cpu pprof_heap pprof_goroutine pprof_block pprof_mutex pprof_all pprof_top pprof_web pprof_diff seed seed_quick seed_custom seed_cases_mixed seed_cases_minimal seed_cases_rich

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

seed:
	node tests/seed/seed.js \
		--api "$(SEED_API)" \
		--users "$(SEED_USERS)" \
		--videos "$(SEED_VIDEOS)" \
		$(SEED_DIR_ARG) \
		$(SEED_PREVIEW_DIR_ARG) \
		$(SEED_AVATAR_DIR_ARG) \
		--title-template "$(SEED_TITLE_TEMPLATE)" \
		--description-template "$(SEED_DESCRIPTION_TEMPLATE)" \
		--tags "$(SEED_TAGS)" \
		--generated-durations "$(SEED_GENERATED_DURATIONS)" \
		$(if $(SEED_TEST_CASES),--test-cases "$(SEED_TEST_CASES)",) \
		--password "$(SEED_PASSWORD)" \
		--prefix "$(SEED_PREFIX)"

seed_quick:
	$(MAKE) seed SEED_USERS=2 SEED_VIDEOS=2

seed_custom:
	$(MAKE) seed

seed_cases_mixed:
	$(MAKE) seed SEED_TEST_CASES=mixed

seed_cases_minimal:
	$(MAKE) seed SEED_TEST_CASES=minimal

seed_cases_rich:
	$(MAKE) seed SEED_TEST_CASES=rich
