/**
 * Сессия админки в localStorage + проверка staff-ролей.
 * Раньше был stub-токен; сейчас access/refresh от NestJS live auth.
 * Staff-gate: роль user в админку не пускаем (только moderator|admin|superadmin).
 */
import type { AuthSession, AuthUser, MeResponse, Role } from "./types";

const STORAGE_KEY = "qp_admin_session";

/** Роли staff: moderator | admin | superadmin — user сюда не входит */
const STAFF_ROLES: ReadonlySet<Role> = new Set([
  "moderator",
  "admin",
  "superadmin",
]);

/** Staff-gate для UI и bootstrap после /users/me */
export function isStaffRole(role: Role | undefined | null): boolean {
  return role != null && STAFF_ROLES.has(role);
}

/** Только superadmin: /users, /settings и смена ролей */
export function isSuperadmin(role: Role | undefined | null): boolean {
  return role === "superadmin";
}

export function mapMeToAuthUser(me: MeResponse): AuthUser {
  return {
    id: me.id,
    email: me.email,
    name: me.displayName?.trim() || me.email.split("@")[0] || "Админ",
    role: me.role,
  };
}

export function mapLoginUserToAuthUser(user: {
  id: string;
  email: string;
  role: Role;
  displayName?: string | null;
  name?: string | null;
}): AuthUser {
  const name =
    user.displayName?.trim() ||
    user.name?.trim() ||
    user.email.split("@")[0] ||
    "Админ";
  return {
    id: user.id,
    email: user.email,
    name,
    role: user.role,
  };
}

export function saveSession(session: AuthSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function loadSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AuthSession> & {
      token?: string;
    };
    // Отбрасываем старый stub-формат { token, user } — нужен access+refresh
    if (
      !parsed?.accessToken ||
      !parsed?.refreshToken ||
      !parsed?.user?.id ||
      !parsed?.user?.email ||
      !parsed?.user?.role
    ) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return {
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
      user: {
        id: parsed.user.id,
        email: parsed.user.email,
        name: parsed.user.name || parsed.user.email.split("@")[0] || "Админ",
        role: parsed.user.role,
      },
    };
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
