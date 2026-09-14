"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import {
  apiErrorMessage,
  deleteAudio,
  listAudio,
} from "@/lib/content-api";
import type { AudioTrack } from "@/lib/types";

export default function AudioPage() {
  const [rows, setRows] = useState<AudioTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(await listAudio());
    } catch (err) {
      setError(apiErrorMessage(err, "Не удалось загрузить аудио"));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onDelete(row: AudioTrack) {
    const label = row.title || row.url;
    if (!window.confirm(`Удалить аудио «${label}»?`)) return;
    try {
      await deleteAudio(row.id);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, "Не удалось удалить аудио"));
    }
  }

  const columns: Column<AudioTrack>[] = [
    {
      key: "title",
      header: "Название",
      render: (r) => r.title || "—",
    },
    {
      key: "url",
      header: "URL",
      render: (r) => (
        <a
          href={r.url}
          target="_blank"
          rel="noreferrer"
          className="line-clamp-1 text-[var(--color-primary)] hover:underline"
        >
          {r.url}
        </a>
      ),
    },
    {
      key: "reciterId",
      header: "Чтец",
      render: (r) => (
        <span className="font-mono text-xs">{r.reciterId.slice(0, 8)}…</span>
      ),
    },
    {
      key: "surahId",
      header: "Сура",
      render: (r) => r.surahId ?? "—",
    },
    {
      key: "durationSec",
      header: "Сек",
      render: (r) => r.durationSec ?? "—",
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <div className="flex items-center gap-3">
          <Link
            href={`/audio/${r.id}/edit`}
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
        title="Аудио"
        description="Аудиозаписи — URL-поля (NestJS API)."
        actionHref="/audio/new"
        actionLabel="Добавить аудио"
      />
      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
      {loading ? (
        <p className="text-sm text-[var(--color-muted-fg)]">Загрузка…</p>
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          emptyTitle="Аудио ещё не добавлено"
          emptyDescription="Добавьте трек с URL и чтецом."
          emptyActionHref="/audio/new"
          emptyActionLabel="Добавить аудио"
        />
      )}
    </div>
  );
}
