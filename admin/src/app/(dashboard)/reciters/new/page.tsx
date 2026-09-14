import { PageHeader } from "@/components/ui/PageHeader";
import { ReciterForm } from "@/components/forms/ReciterForm";

export default function NewReciterPage() {
  return (
    <div>
      <PageHeader title="Новый чтец" description="Создание записи чтеца." />
      <ReciterForm mode="create" />
    </div>
  );
}
