import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";

export default function Page() {
  return (
    <div>
      <PageHeader
        title="Жалобы"
        description="Репорты и жалобы от пользователей."
      />
      <DataTable
        columns={[]}
        rows={[]}
        emptyTitle="Пока пусто"
        emptyDescription="Данные появятся после ввода администратором или модератором. Публичные API не используются."
      />
    </div>
  );
}
