# Quran Plus — архитектура (зафиксировано)

Дата: 2026-09-14  
Источник: Sanat / QP Советник

## Хранение (стек A)
- **Postgres**: [Neon](https://neon.tech)
- **Object storage** (CDN-friendly): [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/)
- **Медиа** (аудио/видео/изображения): только object storage + CDN, **не** в Postgres
- **Чаты** (после фазы 1): сообщения в Postgres; вложения — в R2

## Backend
- NestJS + Prisma → Neon Postgres
- Файлы/стриминг → R2 (presigned URL / public CDN URL)

## Фаза 1 сейчас
Локальный Postgres допустим для dev; миграция на Neon + R2 — следующий инфра-шаг после/параллельно закрытию фазы 1 (API URL + APK smoke).

## Не сейчас
OAuth VK + Google — после закрытия фазы 1.
