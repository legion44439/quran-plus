"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { mockList } from "@/lib/mock-api";
import type { Ayah } from "@/lib/types";

const columns: Column<Ayah>[] = [
  { key: "surahId", header: "Сура", render: (r) => r.surahId },
  { key: "number", header: "№ аята", render: (r) => r.number },
  {
    key: "textAr",
    header: "Текст",
    render: (r) => (
      <span dir="rtl" className="line-clamp-1">
        {r.textAr}
      </span>
    ),
  },
  {
    key: "actions",
    header: "",
    render: (r) => (
      <Link
        href={`/quran/ayahs/${r.id}/edit`}
        className="text-[var(--color-primary)] hover:underline"
      >
        Изменить
      </Link>
    ),
  },
];

export default function AyahsPage() {
  const [rows, setRows] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockList<Ayah>("ayahs").then((res) => {
      setRows(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <PageHeader
        title="Аяты"
        description="Аяты привязаны к сурам (surahId)."
        actionHref="/quran/ayahs/new"
        actionLabel="Добавить аят"
      />
      {loading ? (
        <p className="text-sm text-[var(--color-muted-fg)]">Загрузка…</p>
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          emptyTitle="Аяты ещё не добавлены"
          emptyDescription="Создайте аят и укажите ID суры. Контент не сидируется извне."
          emptyActionHref="/quran/ayahs/new"
          emptyActionLabel="Добавить аят"
        />
      )}
    </div>
  );
}
