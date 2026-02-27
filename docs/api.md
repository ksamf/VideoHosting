# API

## Назначение
Справочник основных endpoint-ов backend API и примеры запросов.

## Базовые URL
- локально: `http://localhost:8080`
- через frontend proxy (docker): `http://localhost:5173/api/...`

## Аутентификация
- `POST /api/signup`
- `POST /api/login`
- `POST /api/logout` (требуется авторизация)
- `GET /api/me` (требуется авторизация)

Пример:
```bash
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

## Видео
- `GET /api/video?limit=20&offset=0`
- `GET /api/video/:id`
- `GET /api/search?q=test&limit=20&offset=0`
- `POST /api/video/upload` (требуется авторизация, multipart form-data)
- `DELETE /api/video/:id` (требуется авторизация)

Пример загрузки:
```bash
curl -X POST http://localhost:8080/api/video/upload \
  -H "Authorization: Bearer <token>" \
  -F "video=@/path/video.mp4" \
  -F "name=Video title" \
  -F "description=Description" \
  -F "tags[]=go" \
  -F "tags[]=backend"
```

## Комментарии, реакции, просмотры
- `GET /api/video/:id/comments`
- `POST /api/video/:id/comment` (требуется авторизация)
- `POST /api/video/:id/reaction?r=like|dislike` (требуется авторизация)
- `GET /api/video/:id/reaction` (требуется авторизация)
- `POST /api/video/:id/views` (опциональная авторизация)

Пример комментария:
```bash
curl -X POST http://localhost:8080/api/video/<video_id>/comment \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"comment":"Great video"}'
```

Пример события просмотра:
```bash
curl -X POST http://localhost:8080/api/video/<video_id>/views \
  -H "Content-Type: application/json" \
  -d '{"device_id":"<uuid>","watched_seconds":35}'
```

## Пользователь и канал
- `GET /api/user/:id`
- `DELETE /api/user/:id` (требуется авторизация)
- `GET /api/user/video/:id`
- `POST /api/user/:id/upload` (требуется авторизация)
- `POST /api/user/channel/:id?action=sub|unsub` (требуется авторизация)
- `GET /api/channel/:id/subcount?period=30`
- `GET /api/channel/:id/views?period=30`
- `GET /api/channel/:id/subscribed`
- `GET /api/user/:id/sub`
- `GET /api/user/:id/sub/video`
- `GET /api/user/:id/watched`
- `GET /api/user/:id/liked`
- `GET /api/user/:id/video`
- `GET /api/user/:id/recommendations?limit=20&offset=0`

## Healthcheck
- `GET /api/status`

## Важные замечания
- write endpoint-ы ограничены rate limiter-ом
- `POST /api/video/upload` и upload аватара ограничены по размеру тела запроса
- поведение cookie/JWT зависит от окружения и auth-конфига
