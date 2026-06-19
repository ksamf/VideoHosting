# Backend

## Назначение

Backend реализует REST API, работу с данными, обработку событий и видео-пайплайн.

## Технологии

- Go
- Gin
- PostgreSQL (`pgx`)
- Redis
- Kafka
- S3-совместимое хранилище
- ffmpeg / ffprobe

## Структура

```text
backend/
├── cmd/                # main, routes, workers bootstrap
├── internal/
│   ├── auth/           # auth handlers + middleware + rate limit
│   ├── handler/        # HTTP handlers
│   ├── database/       # SQL model layer
│   ├── cache/          # redis слой
│   ├── broker/         # kafka reader/writer
│   ├── worker/         # background workers
│   ├── storage/        # S3 integration
│   └── utils/          # ffmpeg/ffprobe/video utils
├── migrations/
├── tests/
└── Makefile
```

## Конфигурация

Источник конфигурации: `backend/internal/config/config.go`.

Основные группы переменных:

- приложение: `APP_HOST`, `APP_PORT`, `APP_MODE`, `CORS_ORIGINS`
- лимиты: `RATE_AUTH_PER_MIN`, `RATE_SEARCH_PER_MIN`, `RATE_WRITE_PER_MIN`, `RATE_VIEWS_PER_MIN`
- загрузки: `UPLOAD_VIDEO_MAX_BYTES`, `UPLOAD_AVATAR_MAX_BYTES`
- видео-обработка: `VIDEO_SOURCE_CRF`, `VIDEO_SOURCE_PRESET`, `VIDEO_ENCODER`, `VIDEO_PROCESS_RETRY_ATTEMPTS`, `VIDEO_PROCESS_RETRY_BACKOFF_MS`
- инфраструктура: DB/Redis/Kafka/S3/JWT

Шаблон: `backend/.env.temp`.

## API и роутинг

Роутинг: `backend/cmd/routes.go`.
Подробная спецификация endpoint-ов: `docs/api.md`.

## Пайплайн обработки видео

1. `POST /api/video/upload`
2. Handler сохраняет оригинал в S3 и публикует задачу в Kafka
3. `StartVideo` worker читает задачу
4. Выполняется нормализация source
5. Запускается single-pass ladder (`ffmpeg`) для всех качеств
6. Результаты загружаются в S3 (`video/{id}/{quality}.mp4`)
7. Статус в БД обновляется в `uploaded` или `failed`

Ключевые файлы:

- `backend/internal/utils/processor.go`
- `backend/internal/utils/transcode.go`
- `backend/internal/worker/video.go`

## Надежность и производительность

- retry + backoff в worker
- идемпотентная проверка статуса задачи
- кеш Redis на read endpoint-ах
- инвалидация кеша на write endpoint-ах
- rate limiting на критичных маршрутах
- pprof в debug-режиме

## Команды

Запуск и тесты:

```bash
cd backend
go test ./...
go run ./cmd
```

Миграции:

```bash
make migrate_up
```

Профилирование:

```bash
make pprof_all
make pprof_top FILE=cpu.pb
```
