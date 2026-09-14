"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getNavForRole } from "@/lib/nav";
import { useAuth } from "@/contexts/AuthContext";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { role, user, logout } = useAuth();
  const items = role ? getNavForRole(role) : [];

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-primary-dark)] text-white">
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-gold)] text-sm font-bold text-[var(--color-primary-dark)]">
            QP
          </span>
          <div>
            <p className="text-sm font-semibold tracking-wide">Quran Plus</p>
            <p className="text-xs text-white/60">Админ-панель</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm transition ${
                active
                  ? "bg-[var(--color-gold)]/20 text-[var(--color-gold)]"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="font-medium">{item.labelRu}</span>
              <span className="ml-1 text-xs opacity-50">/ {item.labelEn}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <p className="truncate text-sm font-medium">{user?.name}</p>
        <p className="truncate text-xs text-white/60">{user?.email}</p>
        <p className="mt-1 inline-block rounded bg-[var(--color-gold)]/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--color-gold)]">
          {role}
        </p>
        <button
          type="button"
          onClick={() => {
            void (async () => {
              await logout();
              router.replace("/login");
            })();
          }}
          className="mt-3 w-full rounded-lg border border-white/20 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10"
        >
          Выйти
        </button>
      </div>
    </aside>
  );
}
