/**
 * Пользователи только для superadmin: список + смена роли.
 * PATCH /users/:id/role — назначает user|moderator|admin|superadmin.
 */

import { ApiError, authorizedJson } from "./api";
import type { AdminUser, Role } from "./types";

export function listUsers(): Promise<AdminUser[]> {
  return authorizedJson<AdminUser[]>("/users");
}

/** Только superadmin назначает роли — PATCH /users/:id/role */
export function updateUserRole(
  id: string,
  role: Role
): Promise<Omit<AdminUser, "createdAt">> {
  return authorizedJson<Omit<AdminUser, "createdAt">>(`/users/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

/** 403 → понятно: нужен superadmin */
export function usersApiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    if (err.status === 403) {
      return "Недостаточно прав. Требуется роль superadmin.";
    }
    if (err.status === 401) {
      return "Сессия истекла. Войдите снова.";
    }
    return err.message || fallback;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
