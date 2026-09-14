import { PageHeader } from "@/components/ui/PageHeader";
import { AyahForm } from "@/components/forms/AyahForm";

export default function NewAyahPage() {
  return (
    <div>
      <PageHeader
        title="Новый аят"
        description="Создание аята, связанного с сурой."
      />
      <AyahForm mode="create" />
    </div>
  );
}
