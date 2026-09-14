"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import {
  apiErrorMessage,
  deleteSurah,
  listSurahs,
} from "@/lib/content-api";
import type { Surah } from "@/lib/types";

export default function SurahsPage() {
  const [rows, setRows] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(await listSurahs());
    } catch (err) {
      setError(apiErrorMessage(err, "Не удалось загрузить суры"));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onDelete(row: Surah) {
    if (!window.confirm(`Удалить суру ${row.id} «${row.nameLatin}»?`)) return;
    try {
      await deleteSurah(row.id);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, "Не удалось удалить суру"));
    }
  }

  const columns: Column<Surah>[] = [
    { key: "id", header: "№", render: (r) => r.id },
    {
      key: "nameLatin",
      header: "Название",
      render: (r) => (
        <span>
          {r.nameLatin}
          {r.nameArabic ? (
            <span dir="rtl" className="ml-2 text-[var(--color-muted-fg)]">
              {r.nameArabic}
            </span>
          ) : null}
        </span>
      ),
    },
    {
      key: "nameEnglish",
      header: "Англ.",
      render: (r) => r.nameEnglish || "—",
    },
    { key: "ayahCount", header: "Аятов", render: (r) => r.ayahCount },
    {
      key: "revelationType",
      header: "Тип",
      render: (r) => r.revelationType || "—",
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <div className="flex items-center gap-3">
          <Link
            href={`/quran/surahs/${r.id}/edit`}
            className="text-[var(--color-primary)] hover:underline"
          >
            Изменить
          </Link>
          <Button type="button" variant="danger" onClick={() => void onDelete(r)}>
            Удалить
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Суры"
        description="Управление сурами Корана. Данные из NestJS API."
        actionHref="/quran/surahs/new"
        actionLabel="Добавить суру"
      />
      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
      {loading ? (
        <p className="text-sm text-[var(--color-muted-fg)]">Загрузка…</p>
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          emptyTitle="Суры ещё не добавлены"
          emptyDescription="Добавьте первую суру через форму."
          emptyActionHref="/quran/surahs/new"
          emptyActionLabel="Добавить суру"
        />
      )}
    </div>
  );
}
