"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import {
  apiErrorMessage,
  createReciter,
  getReciter,
  updateReciter,
} from "@/lib/content-api";
import type { Reciter } from "@/lib/types";

type Props = {
  mode: "create" | "edit";
  id?: string;
  initial?: Partial<Reciter>;
};

export function ReciterForm({ mode, id, initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    nameArabic: initial?.nameArabic ?? "",
    bio: initial?.bio ?? "",
    imageUrl: initial?.imageUrl ?? "",
  });
  const [loading, setLoading] = useState(mode === "edit" && !initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== "edit" || initial || !id) return;
    let cancelled = false;
    (async () => {
      try {
        const reciter = await getReciter(id);
        if (cancelled) return;
        setForm({
          name: reciter.name,
          nameArabic: reciter.nameArabic ?? "",
          bio: reciter.bio ?? "",
          imageUrl: reciter.imageUrl ?? "",
        });
      } catch (err) {
        if (!cancelled) {
          setError(apiErrorMessage(err, "Не удалось загрузить чтеца"));
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
        name: form.name.trim(),
        nameArabic: form.nameArabic.trim() || undefined,
        bio: form.bio.trim() || undefined,
        imageUrl: form.imageUrl.trim() || undefined,
      };
      if (mode === "create") {
        await createReciter(payload);
      } else if (id) {
        await updateReciter(id, payload);
      }
      router.push("/reciters");
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
        label="Имя"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        required
      />
      <Input
        label="Имя (араб.)"
        value={form.nameArabic}
        onChange={(e) =>
          setForm((f) => ({ ...f, nameArabic: e.target.value }))
        }
        dir="rtl"
      />
      <Textarea
        label="Биография"
        value={form.bio}
        onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
      />
      <Input
        label="URL изображения"
        type="url"
        value={form.imageUrl}
        onChange={(e) =>
          setForm((f) => ({ ...f, imageUrl: e.target.value }))
        }
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Сохранение…" : mode === "create" ? "Создать" : "Сохранить"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/reciters")}
        >
          Отмена
        </Button>
      </div>
    </form>
  );
}
