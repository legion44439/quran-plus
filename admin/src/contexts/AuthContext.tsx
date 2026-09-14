"use client";

/**
 * Live-auth вместо stub: bootstrap из localStorage → /users/me (или refresh).
 * Staff-gate: роль user в админку не пускаем на логине и при старте.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  loginApi,
  logoutApi,
  meApi,
  tryRefreshSession,
} from "@/lib/api";
import {
  clearSession,
  isStaffRole,
  loadSession,
  mapLoginUserToAuthUser,
  mapMeToAuthUser,
  saveSession,
} from "@/lib/auth";
import type { AuthSession, AuthUser, Role } from "@/lib/types";

type AuthContextValue = {
  user: AuthUser | null;
  /** Bearer access — для API лучше authorizedFetch из @/lib/api */
  token: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  role: Role | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const stored = loadSession();
      if (!stored) {
        if (!cancelled) {
          setSession(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const me = await meApi(stored.accessToken);
        // Staff-gate: роль user / не-staff — сессию выкидываем
        if (!isStaffRole(me.role)) {
          clearSession();
          if (!cancelled) setSession(null);
          return;
        }
        const next: AuthSession = {
          ...stored,
          user: mapMeToAuthUser(me),
        };
        saveSession(next);
        if (!cancelled) setSession(next);
      } catch {
        const refreshed = await tryRefreshSession();
        if (
          refreshed &&
          isStaffRole(refreshed.user.role) &&
          !cancelled
        ) {
          setSession(refreshed);
        } else {
          clearSession();
          if (!cancelled) setSession(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await loginApi(email, password);
    // Staff-gate на логине: moderator|admin|superadmin
    if (!isStaffRole(tokens.user.role)) {
      throw new Error(
        "У этой учётной записи нет доступа к админ-панели. Требуется роль модератора или администратора."
      );
    }

    let user = mapLoginUserToAuthUser(tokens.user);
    try {
      const me = await meApi(tokens.accessToken);
      user = mapMeToAuthUser(me);
    } catch {
      // /users/me опционален — данных логина хватает для сессии
    }

    const next: AuthSession = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user,
    };
    saveSession(next);
    setSession(next);
  }, []);

  const logout = useCallback(async () => {
    const current = loadSession();
    if (current?.refreshToken) {
      try {
        await logoutApi(current.refreshToken);
      } catch {
        // logout на бэке best-effort: локально всё равно чистим
      }
    }
    clearSession();
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      token: session?.accessToken ?? null,
      accessToken: session?.accessToken ?? null,
      refreshToken: session?.refreshToken ?? null,
      role: session?.user.role ?? null,
      isLoading,
      isAuthenticated: Boolean(session?.accessToken),
      login,
      logout,
    }),
    [session, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
