import { PageHeader } from "@/components/ui/PageHeader";
import { SurahForm } from "@/components/forms/SurahForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditSurahPage({ params }: Props) {
  const { id } = await params;
  return (
    <div>
      <PageHeader
        title="Редактировать суру"
        description={`ID: ${id} (данные из API появятся позже)`}
      />
      <SurahForm mode="edit" id={id} />
    </div>
  );
}
