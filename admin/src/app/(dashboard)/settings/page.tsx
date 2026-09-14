import { PageHeader } from "@/components/ui/PageHeader";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Настройки"
        description="Глобальные настройки приложения (только superadmin)."
      />
      <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 text-sm text-[var(--color-muted-fg)]">
        Заглушка. Здесь появятся параметры приложения, feature flags и интеграции.
      </div>
    </div>
  );
}
