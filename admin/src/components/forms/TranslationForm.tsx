"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import {
  apiErrorMessage,
  createTranslation,
  getTranslation,
  listAyahs,
  listSurahs,
  updateTranslation,
} from "@/lib/content-api";
import type { Ayah, Surah, Translation } from "@/lib/types";

type Props = {
  mode: "create" | "edit";
  id?: string;
  initial?: Partial<Translation>;
};

export function TranslationForm({ mode, id, initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    ayahId: initial?.ayahId ?? "",
    language: initial?.language ?? "ru",
    text: initial?.text ?? "",
    translator: initial?.translator ?? "",
  });
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [filterSurahId, setFilterSurahId] = useState<string>("");
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [surahList, translation] = await Promise.all([
          listSurahs(),
          mode === "edit" && id && !initial
            ? getTranslation(id)
            : Promise.resolve(null),
        ]);
        if (cancelled) return;
        setSurahs(surahList);
        if (translation) {
          setForm({
            ayahId: translation.ayahId,
            language: translation.language,
            text: translation.text,
            translator: translation.translator ?? "",
          });
          // Load ayah to discover surah for filter
          try {
            const allAyahs = await listAyahs();
            if (cancelled) return;
            const found = allAyahs.find((a) => a.id === translation.ayahId);
            if (found) {
              setFilterSurahId(String(found.surahId));
              const filtered = allAyahs.filter(
                (a) => a.surahId === found.surahId
              );
              setAyahs(filtered);
            } else {
              setAyahs(allAyahs);
            }
          } catch {
            /* ayah select optional */
          }
        } else if (surahList.length) {
          setFilterSurahId(String(surahList[0].id));
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

  useEffect(() => {
    if (!filterSurahId) {
      setAyahs([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const list = await listAyahs({ surahId: Number(filterSurahId) });
        if (cancelled) return;
        setAyahs(list);
        if (
          mode === "create" &&
          list.length &&
          !list.some((a) => a.id === form.ayahId)
        ) {
          setForm((f) => ({ ...f, ayahId: list[0].id }));
        }
      } catch {
        if (!cancelled) setAyahs([]);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only refetch when surah filter changes
  }, [filterSurahId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (mode === "create") {
        await createTranslation({
          ayahId: form.ayahId.trim(),
          language: form.language.trim(),
          text: form.text.trim(),
          translator: form.translator.trim() || undefined,
        });
      } else if (id) {
        await updateTranslation(id, {
          language: form.language.trim(),
          text: form.text.trim(),
          translator: form.translator.trim() || undefined,
        });
      }
      router.push("/translations");
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

  const ayahOptions =
    ayahs.length > 0
      ? ayahs.map((a) => ({
          value: a.id,
          label: `${a.surahId}:${a.number} — ${a.textArabic.slice(0, 40)}…`,
        }))
      : form.ayahId
        ? [{ value: form.ayahId, label: form.ayahId }]
        : [{ value: "", label: "Нет аятов" }];

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-xl space-y-4 rounded-xl border border-[var(--color-border)] bg-white p-6"
    >
      {mode === "create" ? (
        <>
          <Select
            label="Сура (фильтр)"
            value={filterSurahId}
            onChange={(e) => setFilterSurahId(e.target.value)}
            options={
              surahs.length
                ? surahs.map((s) => ({
                    value: String(s.id),
                    label: `${s.id}. ${s.nameLatin}`,
                  }))
                : [{ value: "", label: "Нет сур" }]
            }
          />
          <Select
            label="Аят"
            value={form.ayahId}
            onChange={(e) =>
              setForm((f) => ({ ...f, ayahId: e.target.value }))
            }
            options={ayahOptions}
            required
          />
        </>
      ) : (
        <Input
          label="ID аята"
          value={form.ayahId}
          disabled
          hint="ayahId нельзя сменить при обновлении."
        />
      )}
      <Input
        label="Язык"
        value={form.language}
        onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
        hint="Код языка, например ru, en, ar"
        required
      />
      <Textarea
        label="Текст перевода"
        value={form.text}
        onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
        required
      />
      <Input
        label="Переводчик"
        value={form.translator}
        onChange={(e) =>
          setForm((f) => ({ ...f, translator: e.target.value }))
        }
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="flex gap-2 pt-2">
        <Button
          type="submit"
          disabled={saving || (mode === "create" && !form.ayahId)}
        >
          {saving ? "Сохранение…" : mode === "create" ? "Создать" : "Сохранить"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/translations")}
        >
          Отмена
        </Button>
      </div>
    </form>
  );
}
