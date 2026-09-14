# Quran Plus — Backend API

NestJS + PostgreSQL (Prisma) skeleton for **Quran Plus**.

Content (surahs, ayahs, translations, audio, video) is **uploaded by moderators/admins via API** — it is **not** imported from public Quran APIs.

## Stack

- NestJS (TypeScript)
- PostgreSQL 16 via Prisma
- JWT access + refresh (refresh stored hashed; rotated on refresh)
- class-validator / class-transformer
- Swagger at `/api/docs`
- CORS enabled

## Roles

| Role         | Read public content | Write content | Manage users |
|--------------|---------------------|---------------|--------------|
| guest        | yes                 | no            | no           |
| user         | yes                 | no*           | no           |
| moderator    | yes                 | yes           | no           |
| admin        | yes                 | yes           | no           |
| superadmin   | yes                 | yes           | yes          |

\* Users can post comments, favorites, reports, and use group stubs.

`admin` sits between `moderator` and `superadmin`: same content write access as moderator; user list / role updates / audit remain **superadmin-only**.

### Password rules

Min **8** characters, at least **one letter** and **one number** (enforced in `RegisterDto` and `ResetPasswordDto`).

### Password reset (MVP)

No real email provider in phase-1:

1. `POST /api/auth/forgot-password` `{ "email": "..." }` — always returns a generic success message. If the user exists, a hashed reset token + 1h expiry is stored on the user.
2. `POST /api/auth/reset-password` `{ "token": "...", "newPassword": "..." }` — validates token, sets password, clears reset fields, revokes all refresh tokens.

**Development:** when `NODE_ENV !== 'production'`, the forgot-password response includes `resetToken` (also logged to the server console) so mobile/admin can test without email.

## Quick start

```bash
# 1. Start Postgres
docker compose up -d

# 2. Install deps
npm install

# 3. Env
cp .env.example .env
# edit secrets if needed

# 4. Migrate + generate client
npx prisma migrate dev --name init

# 5. Seed superadmin (from SUPERADMIN_EMAIL / SUPERADMIN_PASSWORD)
npx prisma db seed

# 6. Dev server
npm run start:dev
```

API: `http://localhost:4000/api`  
Swagger: `http://localhost:4000/api/docs`  
Health: `http://localhost:4000/api/health`

Production start (after `npm run build`): `npm run start:prod` → `node dist/src/main` (Nest emits under `dist/src/`).

> **Почему `dist/src/main`:** Nest кладёт `main.js` в `dist/src/`, не в корень `dist/` — иначе `start:prod` получит ENOENT.

## Example curls

### Login (seeded superadmin)

```bash
curl -s -X POST http://localhost:4000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@quranplus.local","password":"Admin123!"}'
```

Save `accessToken` from the response.

### Create a surah (moderator|admin|superadmin)

```bash
TOKEN="<accessToken>"

curl -s -X POST http://localhost:4000/api/surahs \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "id": 1,
    "nameArabic": "الفاتحة",
    "nameLatin": "Al-Fatihah",
    "nameEnglish": "The Opening",
    "revelationType": "Meccan",
    "ayahCount": 7
  }'
```

### Public list

```bash
curl -s http://localhost:4000/api/surahs
```

### Search (public)

```bash
curl -s 'http://localhost:4000/api/search?q=fatihah&limit=10'
# optional type=surahs|ayahs|translations|reciters
```

### Forgot / reset password

```bash
# Non-production responses include resetToken for testing
curl -s -X POST http://localhost:4000/api/auth/forgot-password \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com"}'

curl -s -X POST http://localhost:4000/api/auth/reset-password \
  -H 'Content-Type: application/json' \
  -d '{"token":"<resetToken>","newPassword":"NewPass12"}'
```

### Refresh / logout

```bash
curl -s -X POST http://localhost:4000/api/auth/refresh \
  -H 'Content-Type: application/json' \
  -d '{"refreshToken":"<refreshToken>"}'

curl -s -X POST http://localhost:4000/api/auth/logout \
  -H 'Content-Type: application/json' \
  -d '{"refreshToken":"<refreshToken>"}'
```

## Environment (`.env.example`)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Prisma Postgres connection |
| `JWT_ACCESS_SECRET` | Access token secret |
| `JWT_REFRESH_SECRET` | Reserved / documented (refresh uses hashed opaque tokens) |
| `JWT_ACCESS_TTL` | e.g. `15m` |
| `JWT_REFRESH_TTL` | e.g. `7d` |
| `SUPERADMIN_EMAIL` | Seeded admin email |
| `SUPERADMIN_PASSWORD` | Seeded admin password |
| `PORT` | HTTP port (default 4000) |
| `R2_ACCOUNT_ENDPOINT` | Cloudflare R2 S3 API endpoint |
| `R2_ACCESS_KEY_ID` | R2 access key |
| `R2_SECRET_ACCESS_KEY` | R2 secret |
| `R2_BUCKET` | Bucket name from env (example: `quran-plus-media`) |
| `R2_PUBLIC_BASE_URL` | Optional public CDN base (no trailing slash) |
| `R2_ACCOUNT_ID` | Account id (docs / tooling; not required by SDK) |
| `NODE_ENV` | When not `production`, forgot-password returns `resetToken` |

Docker Compose Postgres: user `quran`, password `quran_secret`, db `quran_plus`, port `5432`.

## Modules

**Full CRUD (GET public; POST/PATCH/DELETE = moderator|admin|superadmin):**  
surahs, ayahs, translations, reciters, audio, videos, categories

**Search:** `GET /api/search?q=...&limit=20` (optional `type`) — public

**Auth:** register, login, refresh, logout, forgot-password, reset-password

**Users:** `GET /users/me`; list + role update for superadmin

**Stubs (Prisma-backed, minimal):** comments, favorites, reports, groups/messages

**Media (R2):** `POST /api/media/presign` — moderator|admin|superadmin

**Out of scope:** Redis, payments, full chat, Quran text import, real email delivery


## Media uploads (Cloudflare R2)

Bucket name comes from env `R2_BUCKET` (example placeholder: `quran-plus-media`) — never hardcoded in TypeScript.

1. Login as moderator|admin|superadmin and get `accessToken`.
2. Request a presigned PUT URL:
3. Upload the file with **PUT** to `uploadUrl` using the **same** `Content-Type`.
4. Persist `publicUrl` (or `key`) on your content entity (e.g. `POST /api/audio`).

If `R2_PUBLIC_BASE_URL` is set (no trailing slash), response includes `publicUrl = ${R2_PUBLIC_BASE_URL}/${key}`. If unset, `publicUrl` is `null` — use a private bucket strategy or set a public r2.dev / custom domain base.

```bash
TOKEN="<accessToken>"

# Get presigned PUT
curl -s -X POST http://localhost:4000/api/media/presign \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"contentType":"audio/mpeg","folder":"audio","filename":"surah-1.mp3"}'

# Response: { "uploadUrl", "publicUrl", "key", "expiresIn" }
# Then PUT the binary:
curl -s -X PUT "<uploadUrl>" \
  -H 'Content-Type: audio/mpeg' \
  --data-binary @surah-1.mp3
```

Required env: `R2_ACCOUNT_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`. Optional: `R2_PUBLIC_BASE_URL`, `R2_ACCOUNT_ID` (docs only).

## Scripts

```bash
npm run build          # compile → dist/src/main.js
npm run start:dev      # watch mode
npm run start:prod     # node dist/src/main
npm run prisma:migrate # prisma migrate dev
npm run prisma:seed    # seed superadmin
```
