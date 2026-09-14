import type { Role } from "./types";

export type NavItem = {
  href: string;
  labelRu: string;
  labelEn: string;
  superadminOnly?: boolean;
  section?: string;
  /** Hidden until feature is ready (phase 2) */
  hidden?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", labelRu: "Панель", labelEn: "Dashboard" },
  {
    href: "/users",
    labelRu: "Пользователи",
    labelEn: "Users",
    superadminOnly: true,
  },
  {
    href: "/quran/surahs",
    labelRu: "Суры",
    labelEn: "Surahs",
    section: "Коран",
  },
  {
    href: "/quran/ayahs",
    labelRu: "Аяты",
    labelEn: "Ayahs",
    section: "Коран",
  },
  {
    href: "/translations",
    labelRu: "Переводы",
    labelEn: "Translations",
  },
  { href: "/reciters", labelRu: "Чтецы", labelEn: "Reciters" },
  { href: "/audio", labelRu: "Аудио", labelEn: "Audio" },
  {
    href: "/videos",
    labelRu: "Видео",
    labelEn: "Videos",
    hidden: true,
  },
  { href: "/categories", labelRu: "Категории", labelEn: "Categories" },
  { href: "/comments", labelRu: "Комментарии", labelEn: "Comments" },
  { href: "/reports", labelRu: "Жалобы", labelEn: "Reports" },
  {
    href: "/settings",
    labelRu: "Настройки",
    labelEn: "Settings",
    superadminOnly: true,
  },
];

export function getNavForRole(role: Role): NavItem[] {
  return NAV_ITEMS.filter(
    (item) =>
      !item.hidden &&
      (!item.superadminOnly || role === "superadmin")
  );
}
