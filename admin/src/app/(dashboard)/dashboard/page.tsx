import { PageHeader } from "@/components/ui/PageHeader";

const cards = [
  { title: "Суры", value: "0", href: "/quran/surahs" },
  { title: "Аяты", value: "0", href: "/quran/ayahs" },
  { title: "Переводы", value: "0", href: "/translations" },
  { title: "Жалобы", value: "0", href: "/reports" },
];

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Панель управления"
        description="API подключён (http://localhost:4000/api). Контент добавляется администратором."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <a
            key={card.href}
            href={card.href}
            className="rounded-xl border border-[var(--color-border)] bg-white p-5 transition hover:border-[var(--color-gold)] hover:shadow-sm"
          >
            <p className="text-sm text-[var(--color-muted-fg)]">{card.title}</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--color-primary)]">
              {card.value}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
