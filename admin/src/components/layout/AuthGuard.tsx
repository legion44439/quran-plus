"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { isSuperadmin } from "@/lib/auth";

const SUPERADMIN_ONLY = ["/users", "/settings"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    const needsSuper = SUPERADMIN_ONLY.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`)
    );
    if (needsSuper && !isSuperadmin(role)) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, pathname, role, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] text-[var(--color-muted-fg)]">
        Загрузка…
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
