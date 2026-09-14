# Quran Plus — статус проекта

Обновлено: 2026-09-14  
Контролёр: QP Контроль  
Источник фактов: коммиты + отчёты CODE / QP Советник / QP Infra  
Правило: «сделано» только по факту (SHA / smoke / явное DONE), не по обещаниям.

## Команда
CODE, QP Backend, QP Flutter, QP Admin, QP Infra, QP Материалы, QP Перевод, QP Идеи, QP Советник, QP Контроль, QP Справочник

## Решения (зафиксировано)
- Архитектура **A**: см. [ARCHITECTURE.md](./ARCHITECTURE.md)
- Хранение: **Neon** (Postgres) + **Cloudflare R2** (файлы/медиа, CDN)
- Чаты / соц. лента — **не фаза 1**; позже: сообщения в Postgres, вложения в R2
- OAuth VK + Google — **не трогаем** до закрытия фазы 1

## Фаза 1 (MVP)

| Пункт | Статус | Факт |
|-------|--------|------|
| Репо GitHub private `legion44439/quran-plus` | DONE | remote origin |
| Backend: auth + роли + CRUD + search | DONE | код в `backend/` |
| Auth по почте (регистрация / вход / restore) | DONE | в составе backend/Flutter auth |
| Admin: CRUD + roles | DONE | код в `admin/` |
| Flutter: auth / ридер / аудио / поиск | DONE | код в `mobile/` |
| Home шаблон F + 4 темы | DONE | `0232b48` |
| i18n UI: ar / tg / uz / uz_Cyrl / tr (+ wiring) | DONE | `9bb342c` |
| Русские комментарии (backend / admin / mobile) | DONE | `218b4f5`, `73736cf`, `136424d` |
| API `:4000` health | DONE | smoke ok / health 200 (CODE / QP Советник) |
| Admin `:3000` live | DONE | отчёт CODE |
| Seed сура 1 | DONE | отчёт CODE / QP Советник |
| Neon: migrate + seed | DONE | migrate+seed DONE, health 200 (QP Советник) |
| Media presign (`POST /api/media/presign`) | DONE | `021b658` (main/box); env `R2_BUCKET` |
| `R2_PUBLIC_BASE_URL` / `publicUrl` | DONE | Infra URL + Backend smoke OK (CODE); `https://pub-1174d0af2bc7465bb36bad1557e1b4bf.r2.dev` |
| Admin AudioForm → presign | В РАБОТЕ | QP Admin вяжет форму аудио к `POST /api/media/presign` (CODE) |
| Cloudflare R2 (bindings/auth) | БЛОКЕР | Cloudflare-bindings needsAuth у Sanat |
| Debug APK (test) | DONE | [releases/tag/debug-apk](https://github.com/legion44439/quran-plus/releases/tag/debug-apk) (`quran-plus-debug.apk`) |
| arm64 test APK (Honor) | DONE | [releases/tag/apk-arm64-test](https://github.com/legion44439/quran-plus/releases/tag/apk-arm64-test) (`quran-plus-arm64.apk`, ~19–20 MB) |
| Критерий: регистрация/логин на Android | В РАБОТЕ | APK есть; живые данные с телефона — блокер API URL |
| Критерий: читать/слушать/поиск на устройстве | В РАБОТЕ | UI/темы/навигация ок для смока; данные — блокер API URL |
| Критерий: профиль на устройстве | В РАБОТЕ | зависит от API URL с телефона |
| Критерий: модератор CRUD материалов в web | DONE* | код + admin live (*полный smoke Sanat TBD) |
| Критерий: супер-админ назначает роли | DONE* | код (*полный smoke Sanat TBD) |

Код продукта HEAD: `021b658` (`main`)

## Фаза 2 / бэклог (после фазы 1)
Не начата. Сейчас не в работе.

- Видео-лекции
- Статьи
- Офлайн-загрузка
- Счётчик просмотров
- Достижения (простые)
- Спонсор
- **OAuth VK + Google** (почта уже DONE в фазе 1)

## Блокеры
1. **API URL с телефона** — в APK API = `127.0.0.1:4000` (placeholder), живые данные с Honor не подтягиваются. Нужен реальный API URL + пересборка.
2. **Cloudflare R2** — connector Cloudflare-bindings ещё **needsAuth** у Sanat (QP Infra / медиа).

## Вне фазы 1 / отложено
- Чаты / соц. лента — не фаза 1 (msg → Postgres, attachments → R2)
- Идеи на вырост (QP Идеи) — не в приоритете фазы 1

## Примечания
- Приоритеты меняет только Sanat / QP Советник.
- Этот файл ведёт QP Контроль.
- Neon + `R2_PUBLIC_BASE_URL` + media/presign + backend publicUrl smoke — DONE. В работе: Admin AudioForm→presign. Открыто: Cloudflare-bindings auth, API URL с телефона.
