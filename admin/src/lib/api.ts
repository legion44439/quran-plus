/**
 * Live HTTP к NestJS (не mock): логин, refresh, logout, /users/me, authorizedFetch.
 * API_BASE по умолчанию http://localhost:4000/api — порт backend.
 */
import {
  clearSession,
  loadSession,
  mapMeToAuthUser,
  saveSession,
} from "./auth";
import type {
  AuthSession,
  AuthTokenResponse,
  AuthUser,
  MeResponse,
} from "./types";

/** База NestJS API (:4000/api); переопределяется NEXT_PUBLIC_API_URL */
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export function apiUrl(path: string): string {
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

async function parseJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function messageFromBody(body: unknown, fallback: string): string {
  if (body && typeof body === "object") {
    const rec = body as Record<string, unknown>;
    if (typeof rec.message === "string") return rec.message;
    if (Array.isArray(rec.message) && rec.message.every((m) => typeof m === "string")) {
      return (rec.message as string[]).join(", ");
    }
  }
  return fallback;
}

async function rawFetch(
  path: string,
  init: RequestInit = {}
): Promise<{ res: Response; body: unknown }> {
  const headers = new Headers(init.headers);
  if (init.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(apiUrl(path), { ...init, headers });
  const body = await parseJsonSafe(res);
  return { res, body };
}

/** POST /auth/login → access+refresh; роль проверяем уже в AuthContext */
export async function loginApi(
  email: string,
  password: string
): Promise<AuthTokenResponse> {
  const { res, body } = await rawFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new ApiError(
      messageFromBody(body, "Неверный email или пароль"),
      res.status,
      body
    );
  }
  return body as AuthTokenResponse;
}

/** Ротация токенов без повторного ввода пароля */
export async function refreshApi(
  refreshToken: string
): Promise<AuthTokenResponse> {
  const { res, body } = await rawFetch("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) {
    throw new ApiError(
      messageFromBody(body, "Сессия истекла"),
      res.status,
      body
    );
  }
  return body as AuthTokenResponse;
}

export async function logoutApi(refreshToken: string): Promise<void> {
  await rawFetch("/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

/** Актуальный профиль и роль с бэка (source of truth после логина) */
export async function meApi(accessToken: string): Promise<MeResponse> {
  const { res, body } = await rawFetch("/users/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new ApiError(
      messageFromBody(body, "Не удалось загрузить профиль"),
      res.status,
      body
    );
  }
  return body as MeResponse;
}

function sessionFromTokens(
  tokens: AuthTokenResponse,
  userOverride?: AuthUser
): AuthSession {
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user:
      userOverride ?? {
        id: tokens.user.id,
        email: tokens.user.email,
        name: tokens.user.email.split("@")[0] || "Админ",
        role: tokens.user.role,
      },
  };
}

/** Один общий refresh, чтобы параллельные 401 не крутили токен дважды */
let refreshInFlight: Promise<AuthSession | null> | null = null;

/** Обновить сессию по refreshToken; при ошибке чистим localStorage */
export async function tryRefreshSession(): Promise<AuthSession | null> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const current = loadSession();
    if (!current?.refreshToken) {
      clearSession();
      return null;
    }
    try {
      const tokens = await refreshApi(current.refreshToken);
      let user = current.user;
      try {
        const me = await meApi(tokens.accessToken);
        user = mapMeToAuthUser(me);
      } catch {
        user = {
          id: tokens.user.id,
          email: tokens.user.email,
          name: current.user.name,
          role: tokens.user.role,
        };
      }
      const next = sessionFromTokens(tokens, user);
      saveSession(next);
      return next;
    } catch {
      clearSession();
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

/**
 * Bearer-запрос для staff CRUD.
 * На 401 — один refresh и повтор; если refresh упал, сессия сбрасывается.
 */
export async function authorizedFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const session = loadSession();
  if (!session?.accessToken) {
    throw new ApiError("Не авторизован", 401);
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${session.accessToken}`);
  if (init.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let res = await fetch(apiUrl(path), { ...init, headers });

  if (res.status === 401) {
    const refreshed = await tryRefreshSession();
    if (!refreshed) {
      throw new ApiError("Сессия истекла", 401);
    }
    const retryHeaders = new Headers(init.headers);
    retryHeaders.set("Authorization", `Bearer ${refreshed.accessToken}`);
    if (init.body != null && !retryHeaders.has("Content-Type")) {
      retryHeaders.set("Content-Type", "application/json");
    }
    res = await fetch(apiUrl(path), { ...init, headers: retryHeaders });
  }

  return res;
}

export async function authorizedJson<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await authorizedFetch(path, init);
  const body = await parseJsonSafe(res);
  if (!res.ok) {
    throw new ApiError(
      messageFromBody(body, `Ошибка API (${res.status})`),
      res.status,
      body
    );
  }
  return body as T;
}
