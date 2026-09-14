import { PageHeader } from "@/components/ui/PageHeader";
import { SurahForm } from "@/components/forms/SurahForm";

export default function NewSurahPage() {
  return (
    <div>
      <PageHeader title="Новая сура" description="Создание суры (stub API)." />
      <SurahForm mode="create" />
    </div>
  );
}
