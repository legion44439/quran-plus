"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import {
  apiErrorMessage,
  deleteTranslation,
  listTranslations,
} from "@/lib/content-api";
import type { Translation } from "@/lib/types";

export default function TranslationsPage() {
  const [rows, setRows] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(await listTranslations());
    } catch (err) {
      setError(apiErrorMessage(err, "Не удалось загрузить переводы"));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onDelete(row: Translation) {
    if (!window.confirm(`Удалить перевод (${row.language})?`)) return;
    try {
      await deleteTranslation(row.id);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, "Не удалось удалить перевод"));
    }
  }

  const columns: Column<Translation>[] = [
    {
      key: "ayahId",
      header: "Аят",
      render: (r) => (
        <span className="font-mono text-xs">{r.ayahId.slice(0, 8)}…</span>
      ),
    },
    { key: "language", header: "Язык", render: (r) => r.language },
    {
      key: "text",
      header: "Текст",
      render: (r) => <span className="line-clamp-1">{r.text}</span>,
    },
    {
      key: "translator",
      header: "Переводчик",
      render: (r) => r.translator || "—",
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <div className="flex items-center gap-3">
          <Link
            href={`/translations/${r.id}/edit`}
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
        title="Переводы"
        description="Переводы аятов Корана (NestJS API)."
        actionHref="/translations/new"
        actionLabel="Добавить перевод"
      />
      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
      {loading ? (
        <p className="text-sm text-[var(--color-muted-fg)]">Загрузка…</p>
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          emptyTitle="Переводы ещё не добавлены"
          emptyDescription="Добавьте перевод для аята."
          emptyActionHref="/translations/new"
          emptyActionLabel="Добавить перевод"
        />
      )}
    </div>
  );
}
