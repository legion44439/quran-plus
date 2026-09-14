import { PageHeader } from "@/components/ui/PageHeader";
import { TranslationForm } from "@/components/forms/TranslationForm";

export default function NewTranslationPage() {
  return (
    <div>
      <PageHeader
        title="Новый перевод"
        description="Создание перевода аята."
      />
      <TranslationForm mode="create" />
    </div>
  );
}
