"use client";

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
  /** Access token (Bearer) — prefer authorizedFetch from @/lib/api for calls */
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
      // login payload is enough for session
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
        // ignore network / API errors on logout
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
