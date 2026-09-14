import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";

export default function Page() {
  return (
    <div>
      <PageHeader
        title="Переводы"
        description="Переводы Корана — список и CRUD будут подключены к NestJS."
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
