# Quran Plus — Mobile (Flutter)

**RU** | **EN**

Flutter Android app for Quran Plus. Content (surahs, ayahs, audio, video) comes from the NestJS API / admin — **no** hardcoded Quran text and **no** public Quran APIs.

Контент приходит с NestJS API / админки — **без** хардкода текстов Корана и без публичных Quran API.

## Run / Запуск (Android)

```bash
export PATH="/home/box/flutter/bin:$PATH"   # if needed on this box
cd /workspace/quran-plus/mobile
flutter pub get

# Device / desktop (API on same host):
flutter run --dart-define=API_BASE_URL=http://localhost:4000/api

# Android emulator (host machine's localhost):
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:4000/api
```

Default API base: `http://localhost:4000/api` (`lib/core/config/app_config.dart`).  
Paths are relative to that base (`/auth/login`, `/surahs`, …) — do **not** add another `/api`.

Backend Swagger: `http://localhost:4000/api/docs`

## Auth / Пароль

- Register / login / refresh / logout against NestJS.
- Password: **min 8 chars**, at least **one letter** and **one number**.
- Seeded superadmin (manual test): `admin@quranplus.local` / `Admin123!`
- Forgot-password UI at `/forgot` — `POST /auth/forgot-password` `{email}` and `POST /auth/reset-password` `{token, newPassword}`. Non-prod may return `resetToken` for testing.

## Guest mode / Гость

«Continue as guest» — reading OK; chats/compose stay gated («нужна регистрация»).

## Empty content

Until admins upload surahs/ayahs/audio, lists show **EmptyState**. That is correct — never invent verses.

## Structure / Структура

```
lib/
  core/          # config, theme, router, network, storage, providers
  features/      # splash, onboarding, auth, home, quran, video, chats, profile…
  shared/        # EmptyState, RegistrationGate
assets/translations/  # ru.json, en.json (default locale: ru)
```

RTL-ready layouts (`EdgeInsetsDirectional`).

## Screens / Экраны

| Route | Screen |
|-------|--------|
| `/splash` | Splash |
| `/onboarding` | Onboarding |
| `/login`, `/register`, `/forgot` | Auth |
| `/home` | Home (tab) |
| `/quran`, `/quran/:id` | Surah list + reader |
| `/video`, `/video/:id` | Video list + detail |
| `/chats` | Chats |
| `/profile` | Profile (`GET /users/me`) |
| `/settings` | Settings |
| `/favorites` | Favorites |
| `/downloads` | Downloads |
| `/search` | Search (`GET /search?q=`) |
| `/audio` | Audio player (`GET /audio` + just_audio) |

## Notes

- Android-first; leave `ios/` alone unless compile-breaking.
- JWT access + refresh in `flutter_secure_storage`; 401 triggers one refresh retry.
