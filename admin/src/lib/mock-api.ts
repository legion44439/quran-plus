/**
 * Заглушки для страниц phase-2 / ещё не live (видео, категории, комментарии, жалобы).
 * Live: auth → api.ts (:4000/api), контент Корана → content-api.ts.
 */

import { API_BASE, apiUrl } from "./api";

export type MockListResult<T> = {
  data: T[];
  total: number;
};

async function stubDelay(ms = 200): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

/** Пустой список-заглушка — позже заменить на authorizedFetch */
export async function mockList<T>(
  _resource: string
): Promise<MockListResult<T>> {
  await stubDelay();
  return { data: [], total: 0 };
}

export async function mockGetById<T>(
  _resource: string,
  _id: string
): Promise<T | null> {
  await stubDelay();
  return null;
}

export async function mockCreate<T extends object>(
  _resource: string,
  payload: T
): Promise<T & { id: string }> {
  await stubDelay();
  return {
    ...payload,
    id: `tmp_${Date.now()}`,
  };
}

export async function mockUpdate<T extends object>(
  _resource: string,
  id: string,
  payload: T
): Promise<T & { id: string }> {
  await stubDelay();
  return { ...payload, id };
}

export async function mockDelete(
  _resource: string,
  _id: string
): Promise<{ ok: true }> {
  await stubDelay();
  return { ok: true };
}

export { API_BASE, apiUrl };
