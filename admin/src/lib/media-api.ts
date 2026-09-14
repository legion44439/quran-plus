/**
 * Загрузка файлов в Cloudflare R2 через NestJS POST /media/presign.
 * Зачем: браузер шлёт файл напрямую в R2 по подписанному URL —
 * бэк не проксирует байты, только выдаёт uploadUrl + publicUrl.
 */

import { ApiError, authorizedJson } from "./api";

export type PresignResponse = {
  uploadUrl: string;
  publicUrl: string | null;
  key: string;
  expiresIn: number;
};

export type PresignBody = {
  contentType: string;
  folder?: string;
  filename?: string;
};

/** Staff Bearer → подписанный PUT URL для объекта в R2. */
export async function presignUpload(
  body: PresignBody
): Promise<PresignResponse> {
  return authorizedJson<PresignResponse>("/media/presign", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export type UploadResult = {
  publicUrl: string;
  key: string;
};

/**
 * Presign → PUT в R2 (без Authorization) → publicUrl.
 * Content-Type PUT обязан совпадать с contentType из presign.
 * Если publicUrl null — ошибка (нужен R2_PUBLIC_BASE_URL на бэке).
 */
export async function uploadFileToR2(
  file: File,
  folder?: string
): Promise<UploadResult> {
  const contentType = file.type || "application/octet-stream";
  const presign = await presignUpload({
    contentType,
    folder,
    filename: file.name,
  });

  const putRes = await fetch(presign.uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": contentType },
  });

  if (!putRes.ok) {
    throw new ApiError(
      `Не удалось загрузить файл в R2 (${putRes.status})`,
      putRes.status
    );
  }

  if (!presign.publicUrl) {
    throw new ApiError(
      "Публичный URL недоступен (R2_PUBLIC_BASE_URL не задан на бэке)",
      500
    );
  }

  return { publicUrl: presign.publicUrl, key: presign.key };
}
