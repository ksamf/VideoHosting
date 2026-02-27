# VideoHosting

## Назначение
VideoHosting - full-stack сервис для публикации и просмотра видео с обработкой качества, комментариями, реакциями, подписками и рекомендациями.

## Функционал

- Регистрация/логин/логаут и получение текущего пользователя
- Загрузка видео и аватаров
- Обработка видео через worker (Kafka + ffmpeg)
- Single-pass ladder транскодинг (несколько качеств за один запуск ffmpeg)
- Просмотры, лайки/дизлайки, комментарии
- Подписки на каналы
- История просмотренных/понравившихся
- Рекомендации
- Кеширование ответов в Redis
- Rate limit по группам endpoint-ов

## Технологии

- Frontend: React, TypeScript, MUI, Vite
- Backend: Go, Gin, PostgreSQL, Redis, Kafka, S3, ffmpeg/ffprobe
- Infra: Docker Compose, nginx

## Структура репозитория

```text
.
├── frontend/               # клиент
├── backend/                # API, воркеры, БД, миграции, тесты
├── docs/                   # детальная документация
├── docker-compose.yaml
├── .env.temp              # шаблон env для infra
└── README.md
```

## Запуск через Docker

1. Подготовь env-файлы:
- `.env` из `.env.temp`
- `backend/.env` из `backend/.env.temp`
- `frontend/.env` (например `VITE_API_BASE_URL=http://localhost:8080`)

2. Запусти контейнеры:

```bash
docker compose up --build
```

3. Проверь доступность сервисов:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080`
- Healthcheck: `http://localhost:8080/api/status`

## Локальный запуск

Backend:

```bash
cd backend
go mod download
go test ./...
go run ./cmd
```

Frontend:

```bash
cd frontend
npm ci
npm run dev
```

## Полезные команды

Backend migrations:

```bash
cd backend
make migrate_up
make migrate_down
```

Backend profiling:

```bash
cd backend
make pprof_all
make pprof_top FILE=cpu.pb
```

Load test:

```bash
k6 run backend/tests/load/k6.js
```

## Подробная документация

- Общий индекс: `docs/README.md`
- Backend подробно: `docs/backend.md`
- Frontend подробно: `docs/frontend.md`
- API reference: `docs/api.md`
- Архитектура: `docs/architecture.md`
- Deploy: `docs/deploy.md`
