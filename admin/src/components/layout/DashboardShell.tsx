"use client";

import { AuthGuard } from "./AuthGuard";
import { Sidebar } from "./Sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-[var(--color-background)]">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
