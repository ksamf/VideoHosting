# Frontend

## Назначение

Frontend отвечает за пользовательский интерфейс, маршрутизацию страниц и взаимодействие с backend API.

## Технологии

- React 19
- TypeScript
- MUI
- Vite
- React Router

## Структура

```text
frontend/
├── src/
│   ├── api/            # HTTP-клиент и API-функции
│   ├── components/     # UI-компоненты
│   ├── hooks/          # кастомные хуки
│   ├── pages/          # страницы
│   ├── styles/         # тема и sx-стили
│   ├── skeleton/       # loading skeletons
│   ├── types/          # TS-типы
│   └── utils/          # утилиты
├── Dockerfile
├── nginx.conf
└── package.json
```

## Конфигурация

Файл: `frontend/.env`.

Ключевая переменная:

- `VITE_API_BASE_URL`

В docker-режиме API чаще всего идет через nginx proxy (`/api` -> backend).

## Стили и тема

- общая тема и палитра: `src/styles`
- centralized `sx`-подход
- поддержка светлой и темной темы

## API-слой

- базовый клиент: `src/api/client.ts`
- модули API: `auth.ts`, `videos.ts`, `users.ts` и другие
- типизация ответов/ошибок в `src/types`

## Команды

Локальный запуск:

```bash
cd frontend
npm ci
npm run dev
```

Сборка:

```bash
npm run build
```

Проверки:

```bash
npm run lint
npm run typecheck
```

## Docker и nginx

`frontend/Dockerfile`:

1. build stage (Node): `npm ci && npm run build`
2. runtime stage (nginx): раздача `dist`

`frontend/nginx.conf`:

- SPA fallback на `index.html`
- `gzip`
- cache headers для статических ассетов
- security headers
- proxy `/api/` на backend

## Чеклист перед релизом

- корректность `VITE_API_BASE_URL`/proxy
- авторизация без ручного refresh
- стабильность страниц `Home`, `Watch`, `Channel`, `Studio`
- загрузка видео и аватаров
- состояния `loading/error/skeleton`
- отображение на mobile и desktop
