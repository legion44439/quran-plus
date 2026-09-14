import { PageHeader } from "@/components/ui/PageHeader";
import { SurahForm } from "@/components/forms/SurahForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditSurahPage({ params }: Props) {
  const { id: raw } = await params;
  const id = Number(raw);
  return (
    <div>
      <PageHeader
        title="Редактировать суру"
        description={`Сура № ${Number.isFinite(id) ? id : raw}`}
      />
      <SurahForm mode="edit" id={Number.isFinite(id) ? id : undefined} />
    </div>
  );
}
