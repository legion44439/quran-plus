"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import {
  apiErrorMessage,
  createAyah,
  getAyah,
  listSurahs,
  updateAyah,
} from "@/lib/content-api";
import type { Ayah, Surah } from "@/lib/types";

type Props = {
  mode: "create" | "edit";
  id?: string;
  initial?: Partial<Ayah>;
};

const empty = {
  surahId: 1,
  number: 1,
  textArabic: "",
};

export function AyahForm({ mode, id, initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    surahId: initial?.surahId ?? empty.surahId,
    number: initial?.number ?? empty.number,
    textArabic: initial?.textArabic ?? empty.textArabic,
  });
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [surahList, ayah] = await Promise.all([
          listSurahs(),
          mode === "edit" && id && !initial
            ? getAyah(id)
            : Promise.resolve(null),
        ]);
        if (cancelled) return;
        setSurahs(surahList);
        if (ayah) {
          setForm({
            surahId: ayah.surahId,
            number: ayah.number,
            textArabic: ayah.textArabic,
          });
        } else if (surahList.length && mode === "create" && !initial) {
          setForm((f) => ({ ...f, surahId: surahList[0].id }));
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
      if (mode === "create") {
        await createAyah({
          surahId: Number(form.surahId),
          number: Number(form.number),
          textArabic: form.textArabic.trim(),
        });
      } else if (id) {
        await updateAyah(id, {
          number: Number(form.number),
          textArabic: form.textArabic.trim(),
        });
      }
      router.push("/quran/ayahs");
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

  const surahOptions =
    surahs.length > 0
      ? surahs.map((s) => ({
          value: String(s.id),
          label: `${s.id}. ${s.nameLatin} (${s.nameArabic})`,
        }))
      : [{ value: String(form.surahId), label: `Сура ${form.surahId}` }];

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-xl space-y-4 rounded-xl border border-[var(--color-border)] bg-white p-6"
    >
      <Select
        label="Сура"
        value={String(form.surahId)}
        onChange={(e) =>
          setForm((f) => ({ ...f, surahId: Number(e.target.value) }))
        }
        options={surahOptions}
        disabled={mode === "edit"}
        hint={
          mode === "edit"
            ? "Суру аята нельзя сменить через API обновления."
            : surahs.length === 0
              ? "Сначала создайте суру."
              : undefined
        }
        required
      />
      <Input
        label="Номер аята"
        type="number"
        min={1}
        value={form.number}
        onChange={(e) =>
          setForm((f) => ({ ...f, number: Number(e.target.value) }))
        }
        required
      />
      <Textarea
        label="Текст (араб.)"
        value={form.textArabic}
        onChange={(e) =>
          setForm((f) => ({ ...f, textArabic: e.target.value }))
        }
        dir="rtl"
        required
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={saving || (mode === "create" && surahs.length === 0)}>
          {saving ? "Сохранение…" : mode === "create" ? "Создать" : "Сохранить"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/quran/ayahs")}
        >
          Отмена
        </Button>
      </div>
    </form>
  );
}
