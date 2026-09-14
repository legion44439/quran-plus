import { PageHeader } from "@/components/ui/PageHeader";
import { SurahForm } from "@/components/forms/SurahForm";

export default function NewSurahPage() {
  return (
    <div>
      <PageHeader
        title="Новая сура"
        description="Создание суры. ID = номер суры (1–114)."
      />
      <SurahForm mode="create" />
    </div>
  );
}
