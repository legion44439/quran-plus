import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";

export default function Page() {
  return (
    <div>
      <PageHeader
        title="Чтецы"
        description="Справочник чтецов (reciters)."
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
