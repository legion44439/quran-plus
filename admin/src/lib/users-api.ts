/**
 * Superadmin users API: list + role update via Bearer authorizedJson.
 */

import { ApiError, authorizedJson } from "./api";
import type { AdminUser, Role } from "./types";

export function listUsers(): Promise<AdminUser[]> {
  return authorizedJson<AdminUser[]>("/users");
}

export function updateUserRole(
  id: string,
  role: Role
): Promise<Omit<AdminUser, "createdAt">> {
  return authorizedJson<Omit<AdminUser, "createdAt">>(`/users/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

/** Russian-friendly message from any thrown value */
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
