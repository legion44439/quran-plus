/**
 * Typed content CRUD against NestJS (/surahs, /ayahs, /translations, /reciters, /audio).
 * Mutations use Bearer via authorizedJson; GETs use public fetch (endpoints are @Public).
 */

import { ApiError, apiUrl, authorizedJson } from "./api";
import type {
  Ayah,
  AudioTrack,
  CreateAyahDto,
  CreateAudioDto,
  CreateReciterDto,
  CreateSurahDto,
  CreateTranslationDto,
  Reciter,
  Surah,
  Translation,
  UpdateAyahDto,
  UpdateAudioDto,
  UpdateReciterDto,
  UpdateSurahDto,
  UpdateTranslationDto,
} from "./types";

function messageFromBody(body: unknown, fallback: string): string {
  if (body && typeof body === "object") {
    const rec = body as Record<string, unknown>;
    if (typeof rec.message === "string") return rec.message;
    if (
      Array.isArray(rec.message) &&
      rec.message.every((m) => typeof m === "string")
    ) {
      return (rec.message as string[]).join(", ");
    }
  }
  return fallback;
}

async function publicJson<T>(path: string): Promise<T> {
  const res = await fetch(apiUrl(path));
  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text) as unknown;
    } catch {
      body = text;
    }
  }
  if (!res.ok) {
    throw new ApiError(
      messageFromBody(body, `Ошибка API (${res.status})`),
      res.status,
      body
    );
  }
  return body as T;
}

function qs(
  params: Record<string, string | number | undefined | null>
): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

function omitEmpty<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === "") continue;
    out[k] = v;
  }
  return out as Partial<T>;
}

// ——— Surahs ———

export function listSurahs(): Promise<Surah[]> {
  return publicJson<Surah[]>("/surahs");
}

export function getSurah(id: number): Promise<Surah> {
  return publicJson<Surah>(`/surahs/${id}`);
}

export function createSurah(dto: CreateSurahDto): Promise<Surah> {
  return authorizedJson<Surah>("/surahs", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function updateSurah(id: number, dto: UpdateSurahDto): Promise<Surah> {
  return authorizedJson<Surah>(`/surahs/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}

export function deleteSurah(id: number): Promise<{ success: boolean }> {
  return authorizedJson<{ success: boolean }>(`/surahs/${id}`, {
    method: "DELETE",
  });
}

// ——— Ayahs ———

export function listAyahs(params?: { surahId?: number }): Promise<Ayah[]> {
  return publicJson<Ayah[]>(`/ayahs${qs({ surahId: params?.surahId })}`);
}

export function getAyah(id: string): Promise<Ayah> {
  return publicJson<Ayah>(`/ayahs/${id}`);
}

export function createAyah(dto: CreateAyahDto): Promise<Ayah> {
  return authorizedJson<Ayah>("/ayahs", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function updateAyah(id: string, dto: UpdateAyahDto): Promise<Ayah> {
  return authorizedJson<Ayah>(`/ayahs/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}

export function deleteAyah(id: string): Promise<{ success: boolean }> {
  return authorizedJson<{ success: boolean }>(`/ayahs/${id}`, {
    method: "DELETE",
  });
}

// ——— Translations ———

export function listTranslations(params?: {
  ayahId?: string;
  language?: string;
}): Promise<Translation[]> {
  return publicJson<Translation[]>(
    `/translations${qs({ ayahId: params?.ayahId, language: params?.language })}`
  );
}

export function getTranslation(id: string): Promise<Translation> {
  return publicJson<Translation>(`/translations/${id}`);
}

export function createTranslation(
  dto: CreateTranslationDto
): Promise<Translation> {
  return authorizedJson<Translation>("/translations", {
    method: "POST",
    body: JSON.stringify(omitEmpty(dto as Record<string, unknown>)),
  });
}

export function updateTranslation(
  id: string,
  dto: UpdateTranslationDto
): Promise<Translation> {
  return authorizedJson<Translation>(`/translations/${id}`, {
    method: "PATCH",
    body: JSON.stringify(omitEmpty(dto as Record<string, unknown>)),
  });
}

export function deleteTranslation(id: string): Promise<{ success: boolean }> {
  return authorizedJson<{ success: boolean }>(`/translations/${id}`, {
    method: "DELETE",
  });
}

// ——— Reciters ———

export function listReciters(): Promise<Reciter[]> {
  return publicJson<Reciter[]>("/reciters");
}

export function getReciter(id: string): Promise<Reciter> {
  return publicJson<Reciter>(`/reciters/${id}`);
}

export function createReciter(dto: CreateReciterDto): Promise<Reciter> {
  return authorizedJson<Reciter>("/reciters", {
    method: "POST",
    body: JSON.stringify(omitEmpty(dto as Record<string, unknown>)),
  });
}

export function updateReciter(
  id: string,
  dto: UpdateReciterDto
): Promise<Reciter> {
  return authorizedJson<Reciter>(`/reciters/${id}`, {
    method: "PATCH",
    body: JSON.stringify(omitEmpty(dto as Record<string, unknown>)),
  });
}

export function deleteReciter(id: string): Promise<{ success: boolean }> {
  return authorizedJson<{ success: boolean }>(`/reciters/${id}`, {
    method: "DELETE",
  });
}

// ——— Audio ———

export function listAudio(params?: {
  reciterId?: string;
  surahId?: number;
}): Promise<AudioTrack[]> {
  return publicJson<AudioTrack[]>(
    `/audio${qs({ reciterId: params?.reciterId, surahId: params?.surahId })}`
  );
}

export function getAudio(id: string): Promise<AudioTrack> {
  return publicJson<AudioTrack>(`/audio/${id}`);
}

export function createAudio(dto: CreateAudioDto): Promise<AudioTrack> {
  return authorizedJson<AudioTrack>("/audio", {
    method: "POST",
    body: JSON.stringify(omitEmpty(dto as Record<string, unknown>)),
  });
}

export function updateAudio(
  id: string,
  dto: UpdateAudioDto
): Promise<AudioTrack> {
  return authorizedJson<AudioTrack>(`/audio/${id}`, {
    method: "PATCH",
    body: JSON.stringify(omitEmpty(dto as Record<string, unknown>)),
  });
}

export function deleteAudio(id: string): Promise<{ success: boolean }> {
  return authorizedJson<{ success: boolean }>(`/audio/${id}`, {
    method: "DELETE",
  });
}

/** Russian-friendly message from any thrown value */
export function apiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message || fallback;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
