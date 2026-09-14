"use client";

/**
 * Управление ролями — только superadmin (AuthGuard + API 403).
 * Свою роль менять нельзя, чтобы не потерять доступ.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { useAuth } from "@/contexts/AuthContext";
import {
  listUsers,
  updateUserRole,
  usersApiErrorMessage,
} from "@/lib/users-api";
import type { AdminUser, Role } from "@/lib/types";

/** Все роли NestJS, включая user (лишить staff-доступа) */
const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "user", label: "user" },
  { value: "moderator", label: "moderator" },
  { value: "admin", label: "admin" },
  { value: "superadmin", label: "superadmin" },
];

function formatCreatedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ru");
  } catch {
    return iso;
  }
}

export default function UsersPage() {
  const { user } = useAuth();
  const currentUserId = user?.id;

  const [rows, setRows] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(await listUsers());
    } catch (err) {
      setError(usersApiErrorMessage(err, "Не удалось загрузить пользователей"));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onRoleChange = useCallback(
    async (row: AdminUser, nextRole: Role) => {
      if (row.role === nextRole) return;

      // Защита: не даём снять себе superadmin случайно
      if (currentUserId && row.id === currentUserId) {
        setError("Нельзя изменить собственную роль.");
        return;
      }

      setUpdatingId(row.id);
      setError(null);
      try {
        const updated = await updateUserRole(row.id, nextRole);
        setRows((prev) =>
          prev.map((u) =>
            u.id === row.id ? { ...u, role: updated.role } : u
          )
        );
      } catch (err) {
        setError(usersApiErrorMessage(err, "Не удалось изменить роль"));
      } finally {
        setUpdatingId(null);
      }
    },
    [currentUserId]
  );

  const columns: Column<AdminUser>[] = useMemo(
    () => [
      {
        key: "email",
        header: "Email",
        render: (r) => r.email,
      },
      {
        key: "displayName",
        header: "Имя",
        render: (r) => r.displayName || "—",
      },
      {
        key: "role",
        header: "Роль",
        render: (r) => {
          const isSelf = Boolean(currentUserId && r.id === currentUserId);
          const busy = updatingId === r.id;
          return (
            <select
              className="rounded-lg border border-[var(--color-border)] bg-white px-2 py-1.5 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:cursor-not-allowed disabled:opacity-60"
              value={r.role}
              disabled={isSelf || busy}
              title={
                isSelf ? "Нельзя изменить собственную роль" : undefined
              }
              aria-label={`Роль ${r.email}`}
              onChange={(e) => {
                void onRoleChange(r, e.target.value as Role);
              }}
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          );
        },
      },
      {
        key: "isActive",
        header: "Активен",
        render: (r) => (r.isActive ? "Да" : "Нет"),
      },
      {
        key: "createdAt",
        header: "Создан",
        render: (r) => formatCreatedAt(r.createdAt),
      },
    ],
    [currentUserId, updatingId, onRoleChange]
  );

  return (
    <div>
      <PageHeader
        title="Пользователи"
        description="Управление пользователями (только superadmin)."
      />
      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
      {loading ? (
        <p className="text-sm text-[var(--color-muted-fg)]">Загрузка…</p>
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          emptyTitle="Пользователи не найдены"
          emptyDescription="Список пуст или нет доступа к API."
        />
      )}
    </div>
  );
}
