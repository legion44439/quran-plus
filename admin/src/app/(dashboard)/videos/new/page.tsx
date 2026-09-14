"use client";

import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default function NewVideoPage() {
  return (
    <div>
      <PageHeader
        title="Новое видео"
        description="Раздел временно отключён (phase 2)."
      />
      <EmptyState
        title="Создание видео недоступно"
        description="Вернитесь на дашборд — CRUD видео будет подключён позже."
        actionHref="/dashboard"
        actionLabel="На панель"
      />
      <p className="mt-4 text-center text-xs text-[var(--color-muted-fg)]">
        <Link href="/videos" className="underline">
          К заглушке списка
        </Link>
      </p>
    </div>
  );
}
