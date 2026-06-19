# Seed Data Script

Скрипт создает несколько пользователей и загружает к каждому несколько видео через API:

1. `POST /api/signup`
2. `POST /api/login`
3. `POST /api/video/upload` (с cookie-сессией)

## Требования

- Запущенный backend (`http://localhost:8080` по умолчанию)
- Node.js 20+ (или 18+ с глобальным `fetch`/`FormData`)
- `ffmpeg` в `PATH` (нужно для автогенерации видео/превью, если папки не заданы)

## Быстрый запуск

```bash
node backend/tests/seed/seed.js \
  --api http://localhost:8080/api \
  --users 10 \
  --videos 5 \
  --dir backend/tests/seed/videos \
  --preview-dir backend/tests/seed/previews \
  --avatar-dir backend/tests/seed/avatars \
  --title-template "Видео {u}-{v}: {file}" \
  --description-template "Описание видео {v} пользователя {u}" \
  --tags "seed,user_{u},video_{v},demo" \
  --generated-durations "3,15,45,90" \
  --test-cases mixed \
  --password Qwerty123! \
  --prefix seed_user
```

## Параметры

- `--api` - base URL API (по умолчанию `http://localhost:8080/api`)
- `--users` - количество пользователей (по умолчанию `5`)
- `--videos` - количество загрузок на пользователя (по умолчанию `3`)
- `--dir` - каталог с видео (`.mp4/.webm/.mov/.avi/.mkv`), опционально
- `--preview-dir` - каталог с превью (`.jpg/.jpeg/.png/.webp`), опционально
- `--avatar-dir` - каталог с аватарками (`.jpg/.jpeg/.png/.webp`), опционально
- `--title-template` - шаблон названия видео
- `--description-template` - шаблон описания видео
- `--tags` - теги через запятую (шаблон)
- `--password` - пароль для всех seed-пользователей
- `--prefix` - префикс имени/email пользователя
- `--generated-durations` - длительности (в секундах) для автогенерации видео через запятую (по умолчанию `3,15,45,90`)
- `--test-cases` - профиль тест-кейсов: `mixed | minimal | rich` (по умолчанию выключен)

### Плейсхолдеры в шаблонах

Работают в `--title-template`, `--description-template`, `--tags`:

- `{u}` - индекс пользователя
- `{v}` - индекс видео
- `{file}` - имя файла видео без расширения
- `{ext}` - расширение видео без точки
- `{case}` - имя текущего test-case профиля видео (`full`, `no_description`, `no_tags`, `minimal`)

Пример:

```text
--title-template "u{u}-v{v}-{file}"
--tags "seed,user_{u},video_{v},{ext}"
```

## Примечания

- Если пользователь с email уже существует, шаг `signup` пропускается.
- Если указан `--avatar-dir`, каждому пользователю загружается аватар (`POST /api/user/:id/upload`).
- Если `--avatar-dir` не указан, скрипт генерирует аватарки: разные цвета + первая буква ника.
- Если указан `--preview-dir`, к видео прикладывается `preview` в multipart upload.
- Если `--preview-dir` не указан, скрипт генерирует превью под каждый upload: черный фон и название видео по центру.
- Если `--dir` не указан, скрипт генерирует тестовые mp4 через `ffmpeg`.
- Если генерация включена, в логах показывается путь `generatedAssetsDir`.
- Загрузка видео асинхронная: после upload worker еще обрабатывает файл.

## Профили test-cases

- `mixed`:
  - пользователи: аватар через одного (с/без)
  - видео-циклы: `full`, `no_description`, `no_tags`, `minimal`
- `minimal`:
  - пользователи без аватаров
  - видео без описания и тегов
- `rich`:
  - у всех пользователей есть аватар (если есть файлы в `--avatar-dir`)
  - все видео с описанием, тегами и превью (если есть `--preview-dir`)
