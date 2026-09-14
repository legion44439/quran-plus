# Home — шаблон F (MVP)

Источник: решение Sanat через QP Советник, 2026-09-14.

## Структура Home (сверху вниз)
1. **AppBar + Search**
2. **Приветствие**
3. **Listen today** — блок «слушать сегодня»
4. **Continue reading** — продолжить чтение
5. **Ряды**: Quran / Bookmarks / Settings (темы)
6. **Bottom nav** — без изменений состава фазы 1

## Вне MVP Home
Без daily ayah / лекций / спонсора на главной.

## Темы (Settings/Profile)
| id | Name | Notes |
|----|------|-------|
| emerald | Emerald | DEFAULT — deep emerald + gold |
| sapphire | Sapphire | deep navy + gold |
| charcoalCopper | Charcoal Copper | near-black + warm copper |
| burgundy | Burgundy | deep maroon/plum + gold |

ThemeData/ColorScheme на каждую; выбор сохранять локально.
Не ломать auth/API фазы 1.
