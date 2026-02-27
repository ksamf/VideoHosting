# Архитектура

## Назначение
Описание компонентов системы и ключевых потоков данных.

## Компоненты
- frontend (`frontend`) - React + TypeScript + MUI
- backend API (`backend/cmd` + `backend/internal`)
- PostgreSQL - основное хранилище данных
- Redis - кеш и состояние rate limit
- Kafka - асинхронные события для worker-ов
- S3-совместимое хранилище - исходники и обработанные медиа

## Топология рантайма
```text
Browser
  -> Frontend (nginx, :5173 host -> :80 container)
  -> /api/* proxy
      -> Backend (:8080)
          -> PostgreSQL
          -> Redis
          -> Kafka
          -> S3
```

## Слои backend
- `internal/handler` - HTTP handlers
- `internal/auth` - авторизация и middleware
- `internal/database` - SQL-модели и запросы
- `internal/cache` - Redis-слой и лимиты
- `internal/broker` - Kafka producers/consumers
- `internal/worker` - фоновые обработчики
- `internal/utils` - ffmpeg/ffprobe-утилиты

## Поток загрузки и обработки видео
1. Клиент вызывает `POST /api/video/upload`
2. Handler пишет оригинал в S3 и создает задачу в Kafka
3. Worker читает задачу
4. Worker нормализует source
5. Worker выполняет single-pass ladder (`ffmpeg split + scale`)
6. Результаты загружаются в S3 как `video/{id}/{quality}.mp4`
7. В БД обновляется статус (`uploaded` или `failed`)

## Кеширование
- read endpoint-ы читают данные из Redis-ключей
- write endpoint-ы инвалидируют ключи/паттерны
- цель: снизить нагрузку на БД и стабилизировать latency

## Надежность
- retry + backoff в worker
- rate limiting по группам endpoint-ов
- ограничение размера запроса при upload
- статус обработки в БД как source of truth
