"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { mockCreate, mockUpdate } from "@/lib/mock-api";

type Props = {
  mode: "create" | "edit";
  id?: string;
  initial?: {
    titleRu: string;
    titleEn?: string;
    descriptionRu?: string;
    url: string;
    thumbnailUrl?: string;
    categoryId?: string;
    durationSec?: number;
    published: boolean;
  };
};

const empty = {
  titleRu: "",
  titleEn: "",
  descriptionRu: "",
  url: "",
  thumbnailUrl: "",
  categoryId: "",
  durationSec: 0,
  published: false,
};

export function VideoForm({ mode, id, initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(initial ?? empty);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      if (mode === "create") {
        await mockCreate("videos", form);
        setMessage("Видео сохранено (stub).");
      } else if (id) {
        await mockUpdate("videos", id, form);
        setMessage("Видео обновлено (stub).");
      }
      setTimeout(() => router.push("/videos"), 600);
    } catch {
      setMessage("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-xl space-y-4 rounded-xl border border-[var(--color-border)] bg-white p-6"
    >
      <Input
        label="Название (рус.)"
        value={form.titleRu}
        onChange={(e) => setForm((f) => ({ ...f, titleRu: e.target.value }))}
        required
      />
      <Input
        label="Название (англ.)"
        value={form.titleEn ?? ""}
        onChange={(e) => setForm((f) => ({ ...f, titleEn: e.target.value }))}
      />
      <Textarea
        label="Описание"
        value={form.descriptionRu ?? ""}
        onChange={(e) =>
          setForm((f) => ({ ...f, descriptionRu: e.target.value }))
        }
      />
      <Input
        label="URL видео"
        type="url"
        value={form.url}
        onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
        hint="Позже — загрузка в S3/CDN"
        required
      />
      <Input
        label="URL превью"
        type="url"
        value={form.thumbnailUrl ?? ""}
        onChange={(e) =>
          setForm((f) => ({ ...f, thumbnailUrl: e.target.value }))
        }
      />
      <Input
        label="ID категории"
        value={form.categoryId ?? ""}
        onChange={(e) =>
          setForm((f) => ({ ...f, categoryId: e.target.value }))
        }
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
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) =>
            setForm((f) => ({ ...f, published: e.target.checked }))
          }
          className="h-4 w-4 rounded border-[var(--color-border)]"
        />
        Опубликовано
      </label>
      {message ? (
        <p className="text-sm text-[var(--color-primary)]">{message}</p>
      ) : null}
      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Сохранение…" : mode === "create" ? "Создать" : "Сохранить"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/videos")}
        >
          Отмена
        </Button>
      </div>
    </form>
  );
}
