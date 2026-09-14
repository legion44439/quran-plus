"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import {
  apiErrorMessage,
  deleteAyah,
  listAyahs,
  listSurahs,
} from "@/lib/content-api";
import type { Ayah, Surah } from "@/lib/types";

export default function AyahsPage() {
  const [rows, setRows] = useState<Ayah[]>([]);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [surahFilter, setSurahFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ayahs, surahList] = await Promise.all([
        listAyahs(
          surahFilter ? { surahId: Number(surahFilter) } : undefined
        ),
        listSurahs(),
      ]);
      setRows(ayahs);
      setSurahs(surahList);
    } catch (err) {
      setError(apiErrorMessage(err, "Не удалось загрузить аяты"));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [surahFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onDelete(row: Ayah) {
    if (
      !window.confirm(
        `Удалить аят ${row.surahId}:${row.number}?`
      )
    ) {
      return;
    }
    try {
      await deleteAyah(row.id);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, "Не удалось удалить аят"));
    }
  }

  const columns: Column<Ayah>[] = [
    { key: "surahId", header: "Сура", render: (r) => r.surahId },
    { key: "number", header: "№ аята", render: (r) => r.number },
    {
      key: "textArabic",
      header: "Текст",
      render: (r) => (
        <span dir="rtl" className="line-clamp-1">
          {r.textArabic}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <div className="flex items-center gap-3">
          <Link
            href={`/quran/ayahs/${r.id}/edit`}
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
        title="Аяты"
        description="Аяты привязаны к сурам (surahId)."
        actionHref="/quran/ayahs/new"
        actionLabel="Добавить аят"
      />
      <div className="mb-4 max-w-xs">
        <Select
          label="Фильтр по суре"
          value={surahFilter}
          onChange={(e) => setSurahFilter(e.target.value)}
          options={[
            { value: "", label: "Все суры" },
            ...surahs.map((s) => ({
              value: String(s.id),
              label: `${s.id}. ${s.nameLatin}`,
            })),
          ]}
        />
      </div>
      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
      {loading ? (
        <p className="text-sm text-[var(--color-muted-fg)]">Загрузка…</p>
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          emptyTitle="Аяты ещё не добавлены"
          emptyDescription="Создайте аят и укажите суру."
          emptyActionHref="/quran/ayahs/new"
          emptyActionLabel="Добавить аят"
        />
      )}
    </div>
  );
}
