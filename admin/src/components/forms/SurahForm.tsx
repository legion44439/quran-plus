"use client";

/**
 * Форма суры → NestJS /surahs.
 * Сура создаётся с числовым id 1–114, как в NestJS; при edit id нельзя менять.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import {
  apiErrorMessage,
  createSurah,
  getSurah,
  updateSurah,
} from "@/lib/content-api";
import type { Surah } from "@/lib/types";

type Props = {
  mode: "create" | "edit";
  /** Числовой id суры (1–114) */
  id?: number;
  initial?: Partial<Surah>;
};

const empty = {
  id: 1,
  nameArabic: "",
  nameLatin: "",
  nameEnglish: "",
  ayahCount: 0,
  revelationType: "Meccan",
};

export function SurahForm({ mode, id, initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    id: initial?.id ?? empty.id,
    nameArabic: initial?.nameArabic ?? empty.nameArabic,
    nameLatin: initial?.nameLatin ?? empty.nameLatin,
    nameEnglish: initial?.nameEnglish ?? empty.nameEnglish,
    ayahCount: initial?.ayahCount ?? empty.ayahCount,
    revelationType: initial?.revelationType ?? empty.revelationType,
  });
  const [loading, setLoading] = useState(mode === "edit" && !initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== "edit" || initial) {
      setLoading(false);
      return;
    }
    if (id == null) {
      setError("Некорректный ID суры");
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const surah = await getSurah(id);
        if (cancelled) return;
        setForm({
          id: surah.id,
          nameArabic: surah.nameArabic,
          nameLatin: surah.nameLatin,
          nameEnglish: surah.nameEnglish ?? "",
          ayahCount: surah.ayahCount,
          revelationType: surah.revelationType ?? "Meccan",
        });
      } catch (err) {
        if (!cancelled) {
          setError(apiErrorMessage(err, "Не удалось загрузить суру"));
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
        await createSurah({
          id: form.id,
          nameArabic: form.nameArabic.trim(),
          nameLatin: form.nameLatin.trim(),
          nameEnglish: form.nameEnglish.trim() || undefined,
          revelationType: form.revelationType || undefined,
          ayahCount: form.ayahCount,
        });
      } else if (id != null) {
        await updateSurah(id, {
          nameArabic: form.nameArabic.trim(),
          nameLatin: form.nameLatin.trim(),
          nameEnglish: form.nameEnglish.trim() || undefined,
          revelationType: form.revelationType || undefined,
          ayahCount: form.ayahCount,
        });
      }
      router.push("/quran/surahs");
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

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-xl space-y-4 rounded-xl border border-[var(--color-border)] bg-white p-6"
    >
      <Input
        label="Номер суры (ID)"
        type="number"
        min={1}
        max={114}
        value={form.id}
        onChange={(e) =>
          setForm((f) => ({ ...f, id: Number(e.target.value) }))
        }
        required
        disabled={mode === "edit"}
        hint={
          mode === "create"
            ? "ID суры = номер суры (1–114). Задаётся при создании."
            : "ID суры нельзя изменить."
        }
      />
      <Input
        label="Название (араб.)"
        value={form.nameArabic}
        onChange={(e) =>
          setForm((f) => ({ ...f, nameArabic: e.target.value }))
        }
        dir="rtl"
        required
      />
      <Input
        label="Название (латиница)"
        value={form.nameLatin}
        onChange={(e) =>
          setForm((f) => ({ ...f, nameLatin: e.target.value }))
        }
        required
      />
      <Input
        label="Название (англ.)"
        value={form.nameEnglish}
        onChange={(e) =>
          setForm((f) => ({ ...f, nameEnglish: e.target.value }))
        }
      />
      <Input
        label="Число аятов"
        type="number"
        min={0}
        value={form.ayahCount}
        onChange={(e) =>
          setForm((f) => ({ ...f, ayahCount: Number(e.target.value) }))
        }
      />
      <Select
        label="Тип ниспослания"
        value={form.revelationType || ""}
        onChange={(e) =>
          setForm((f) => ({ ...f, revelationType: e.target.value }))
        }
        options={[
          { value: "Meccan", label: "Мекканская (Meccan)" },
          { value: "Medinan", label: "Мединская (Medinan)" },
        ]}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Сохранение…" : mode === "create" ? "Создать" : "Сохранить"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/quran/surahs")}
        >
          Отмена
        </Button>
      </div>
    </form>
  );
}
