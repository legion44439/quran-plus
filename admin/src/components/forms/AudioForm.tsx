"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import {
  apiErrorMessage,
  createAudio,
  getAudio,
  listReciters,
  listSurahs,
  updateAudio,
} from "@/lib/content-api";
import type { AudioTrack, Reciter, Surah } from "@/lib/types";

type Props = {
  mode: "create" | "edit";
  id?: string;
  initial?: Partial<AudioTrack>;
};

export function AudioForm({ mode, id, initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    url: initial?.url ?? "",
    durationSec: initial?.durationSec ?? 0,
    reciterId: initial?.reciterId ?? "",
    surahId: initial?.surahId != null ? String(initial.surahId) : "",
    ayahId: initial?.ayahId ?? "",
  });
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [reciterList, surahList, track] = await Promise.all([
          listReciters(),
          listSurahs(),
          mode === "edit" && id && !initial
            ? getAudio(id)
            : Promise.resolve(null),
        ]);
        if (cancelled) return;
        setReciters(reciterList);
        setSurahs(surahList);
        if (track) {
          setForm({
            title: track.title ?? "",
            url: track.url,
            durationSec: track.durationSec ?? 0,
            reciterId: track.reciterId,
            surahId: track.surahId != null ? String(track.surahId) : "",
            ayahId: track.ayahId ?? "",
          });
        } else if (reciterList.length && mode === "create" && !initial) {
          setForm((f) => ({ ...f, reciterId: reciterList[0].id }));
        }
      } catch (err) {
        if (!cancelled) {
          setError(apiErrorMessage(err, "Не удалось загрузить данные"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, id, initial]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: form.title.trim() || undefined,
        url: form.url.trim(),
        durationSec: form.durationSec ? Number(form.durationSec) : undefined,
        reciterId: form.reciterId,
        surahId: form.surahId ? Number(form.surahId) : undefined,
        ayahId: form.ayahId.trim() || undefined,
      };
      if (mode === "create") {
        await createAudio(payload);
      } else if (id) {
        await updateAudio(id, payload);
      }
      router.push("/audio");
    } catch (err) {
      setError(apiErrorMessage(err, "Ошибка сохранения"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p className="text-sm text-[var(--color-muted-fg)]">Загрузка…</p>
    );
  }

  const reciterOptions =
    reciters.length > 0
      ? reciters.map((r) => ({
          value: r.id,
          label: r.nameArabic ? `${r.name} (${r.nameArabic})` : r.name,
        }))
      : [{ value: "", label: "Нет чтецов" }];

  const surahOptions = [
    { value: "", label: "— без суры —" },
    ...surahs.map((s) => ({
      value: String(s.id),
      label: `${s.id}. ${s.nameLatin}`,
    })),
  ];

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-xl space-y-4 rounded-xl border border-[var(--color-border)] bg-white p-6"
    >
      <Input
        label="Название"
        value={form.title}
        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
      />
      <Input
        label="URL аудио"
        type="url"
        value={form.url}
        onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
        required
      />
      <Input
        label="Длительность (сек)"
        type="number"
        min={0}
        value={form.durationSec ?? 0}
        onChange={(e) =>
          setForm((f) => ({ ...f, durationSec: Number(e.target.value) }))
        }
      />
      <Select
        label="Чтец"
        value={form.reciterId}
        onChange={(e) =>
          setForm((f) => ({ ...f, reciterId: e.target.value }))
        }
        options={reciterOptions}
        required
        hint={
          reciters.length === 0 ? "Сначала создайте чтеца." : undefined
        }
      />
      <Select
        label="Сура (опционально)"
        value={form.surahId}
        onChange={(e) => setForm((f) => ({ ...f, surahId: e.target.value }))}
        options={surahOptions}
      />
      <Input
        label="ID аята (опционально)"
        value={form.ayahId}
        onChange={(e) => setForm((f) => ({ ...f, ayahId: e.target.value }))}
        hint="UUID аята, если трек привязан к конкретному аяту"
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="flex gap-2 pt-2">
        <Button
          type="submit"
          disabled={saving || !form.reciterId || !form.url}
        >
          {saving ? "Сохранение…" : mode === "create" ? "Создать" : "Сохранить"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/audio")}
        >
          Отмена
        </Button>
      </div>
    </form>
  );
}
