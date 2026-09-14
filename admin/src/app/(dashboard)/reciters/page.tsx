"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import {
  apiErrorMessage,
  deleteReciter,
  listReciters,
} from "@/lib/content-api";
import type { Reciter } from "@/lib/types";

export default function RecitersPage() {
  const [rows, setRows] = useState<Reciter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(await listReciters());
    } catch (err) {
      setError(apiErrorMessage(err, "Не удалось загрузить чтецов"));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onDelete(row: Reciter) {
    if (!window.confirm(`Удалить чтеца «${row.name}»?`)) return;
    try {
      await deleteReciter(row.id);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, "Не удалось удалить чтеца"));
    }
  }

  const columns: Column<Reciter>[] = [
    { key: "name", header: "Имя", render: (r) => r.name },
    {
      key: "nameArabic",
      header: "Араб.",
      render: (r) =>
        r.nameArabic ? (
          <span dir="rtl">{r.nameArabic}</span>
        ) : (
          "—"
        ),
    },
    {
      key: "bio",
      header: "Био",
      render: (r) => (
        <span className="line-clamp-1">{r.bio || "—"}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <div className="flex items-center gap-3">
          <Link
            href={`/reciters/${r.id}/edit`}
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
        title="Чтецы"
        description="Справочник чтецов (NestJS API)."
        actionHref="/reciters/new"
        actionLabel="Добавить чтеца"
      />
      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
      {loading ? (
        <p className="text-sm text-[var(--color-muted-fg)]">Загрузка…</p>
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          emptyTitle="Чтецы ещё не добавлены"
          emptyDescription="Добавьте первого чтеца."
          emptyActionHref="/reciters/new"
          emptyActionLabel="Добавить чтеца"
        />
      )}
    </div>
  );
}
