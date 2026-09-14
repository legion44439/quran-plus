import { PageHeader } from "@/components/ui/PageHeader";
import { TranslationForm } from "@/components/forms/TranslationForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditTranslationPage({ params }: Props) {
  const { id } = await params;
  return (
    <div>
      <PageHeader title="Редактировать перевод" description={`ID: ${id}`} />
      <TranslationForm mode="edit" id={id} />
    </div>
  );
}
