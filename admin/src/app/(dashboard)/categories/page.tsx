import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";

export default function Page() {
  return (
    <div>
      <PageHeader
        title="Категории"
        description="Категории для видео и прочего контента."
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
