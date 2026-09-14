"use client";

/**
 * Форма чтеца → NestJS /reciters.
 * imageUrl можно вставить вручную или загрузить в R2 (folder «reciters»).
 */

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
import { uploadFileToR2 } from "@/lib/media-api";
import type { Reciter } from "@/lib/types";

type Props = {
  mode: "create" | "edit";
  id?: string;
  initial?: Partial<Reciter>;
};

type UploadStatus =
  | { kind: "idle" }
  | { kind: "uploading"; name: string }
  | { kind: "ok"; name: string }
  | { kind: "error"; message: string };

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
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    kind: "idle",
  });

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

  async function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploadStatus({ kind: "uploading", name: file.name });
    setError(null);
    try {
      const result = await uploadFileToR2(file, "reciters");
      setForm((f) => ({ ...f, imageUrl: result.publicUrl }));
      setUploadStatus({ kind: "ok", name: file.name });
    } catch (err) {
      setUploadStatus({
        kind: "error",
        message: apiErrorMessage(err, "Ошибка загрузки файла"),
      });
    }
  }

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

  const uploading = uploadStatus.kind === "uploading";

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
        onChange={(e) => {
          setForm((f) => ({ ...f, imageUrl: e.target.value }));
          if (uploadStatus.kind === "ok" || uploadStatus.kind === "error") {
            setUploadStatus({ kind: "idle" });
          }
        }}
        hint="Вставьте ссылку или загрузите файл ниже"
      />

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-[var(--color-foreground)]">
          Загрузить файл
        </span>
        <input
          type="file"
          accept="image/*"
          disabled={uploading || saving}
          onChange={onFileSelected}
          className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[var(--color-primary)]/10 file:px-3 file:py-1 file:text-sm file:font-medium"
        />
        {uploadStatus.kind === "uploading" ? (
          <span className="text-xs text-[var(--color-muted-fg)]">
            Загрузка «{uploadStatus.name}» в R2…
          </span>
        ) : null}
        {uploadStatus.kind === "ok" ? (
          <span className="text-xs text-emerald-700">
            Файл «{uploadStatus.name}» загружен — URL подставлен
          </span>
        ) : null}
        {uploadStatus.kind === "error" ? (
          <span className="text-xs text-red-600">{uploadStatus.message}</span>
        ) : null}
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={saving || uploading}>
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
