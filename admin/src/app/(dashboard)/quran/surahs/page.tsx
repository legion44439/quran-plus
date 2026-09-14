"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { mockList } from "@/lib/mock-api";
import type { Surah } from "@/lib/types";

const columns: Column<Surah>[] = [
  { key: "number", header: "№", render: (r) => r.number },
  { key: "nameRu", header: "Название", render: (r) => r.nameRu || r.nameAr },
  { key: "ayahCount", header: "Аятов", render: (r) => r.ayahCount },
  {
    key: "actions",
    header: "",
    render: (r) => (
      <Link
        href={`/quran/surahs/${r.id}/edit`}
        className="text-[var(--color-primary)] hover:underline"
      >
        Изменить
      </Link>
    ),
  },
];

export default function SurahsPage() {
  const [rows, setRows] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockList<Surah>("surahs").then((res) => {
      setRows(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <PageHeader
        title="Суры"
        description="Управление сурами Корана. Контент вводится вручную."
        actionHref="/quran/surahs/new"
        actionLabel="Добавить суру"
      />
      {loading ? (
        <p className="text-sm text-[var(--color-muted-fg)]">Загрузка…</p>
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          emptyTitle="Суры ещё не добавлены"
          emptyDescription="Добавьте первую суру через форму. Данные не подтягиваются из публичных API."
          emptyActionHref="/quran/surahs/new"
          emptyActionLabel="Добавить суру"
        />
      )}
    </div>
  );
}
