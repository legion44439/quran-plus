# Quran Plus — Admin Panel

Каркас админ-панели на **Next.js (App Router) + TypeScript + Tailwind**.

Контент (Коран, переводы, аудио, видео) вводится администратором / модератором.  
Публичные API Корана **не** используются и не сидируются.

## Запуск

```bash
cd /workspace/quran-plus/admin
cp .env.local.example .env.local   # при необходимости
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

Backend NestJS должен быть доступен на `http://localhost:4000/api`  
(см. `NEXT_PUBLIC_API_URL` в `.env.local`).

Сборка:

```bash
npm run build
npm start
```

## Авторизация (NestJS)

Реальная JWT-авторизация через backend:

| Метод | Путь | Назначение |
|-------|------|------------|
| POST | `/auth/login` | `{ email, password }` → access + refresh + user |
| POST | `/auth/refresh` | `{ refreshToken }` → новые токены |
| POST | `/auth/logout` | `{ refreshToken }` → revoke |
| GET | `/users/me` | текущий пользователь (Bearer access) |

- Сессия в `localStorage` (`qp_admin_session`): `{ accessToken, refreshToken, user }`.
- `displayName` с `/users/me` мапится в `user.name`.
- В админку пускаются только **moderator**, **admin**, **superadmin**. Роль `user` отклоняется с сообщением на русском.
- При 401 клиент один раз пробует refresh и повторяет запрос; при неудаче сессия очищается.
- Пункты **Пользователи** и **Настройки** — только **superadmin**.
- Раздел **Видео** временно скрыт в навигации (phase 2).

### Seed (backend)

| Email | Пароль | Роль |
|-------|--------|------|
| `admin@quranplus.local` | `Admin123!` | superadmin |

## Структура

```
src/
  app/
    login/                 # вход
    (dashboard)/           # защищённая зона + sidebar
      dashboard/
      users/               # superadmin
      quran/surahs|ayahs/
      videos/              # скрыто в nav
      translations|reciters|audio|categories|comments|reports|settings
  components/
    layout/                # Sidebar, AuthGuard, DashboardShell
    forms/ ui/
  contexts/AuthContext.tsx
  lib/
    api.ts                 # login/refresh/logout/me + authorizedFetch
    auth.ts                # session storage + staff helpers
    mock-api.ts            # заглушки CRUD
    nav.ts
    types.ts
```

## Env

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Бренд

Глубокий зелёный (`--color-primary`) + мягкое золото (`--color-gold`), светлый фон, русские подписи в UI.

## Стек

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- ESLint
