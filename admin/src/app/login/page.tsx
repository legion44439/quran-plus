"use client";

/**
 * Вход в админку: POST /auth/login через AuthContext.
 * Уже залогиненного staff сразу шлём на /dashboard.
 */

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Если сессия staff уже есть — форма логина не нужна
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-primary-dark)] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-gold)]/30 bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-gold)] text-lg font-bold text-[var(--color-primary-dark)]">
            QP
          </div>
          <h1 className="text-xl font-semibold text-[var(--color-foreground)]">
            Quran Plus
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted-fg)]">
            Вход в админ-панель
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            name="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@quranplus.local"
            required
          />
          <Input
            label="Пароль"
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Вход…" : "Войти"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-[var(--color-muted-fg)]">
          Учётные данные выдаёт backend (NestJS). Seed:{" "}
          <code className="rounded bg-[var(--color-muted)] px-1 py-0.5">
            admin@quranplus.local
          </code>{" "}
          /{" "}
          <code className="rounded bg-[var(--color-muted)] px-1 py-0.5">
            Admin123!
          </code>
          . Доступ только для ролей moderator, admin и superadmin.
        </p>
      </div>
    </div>
  );
}
