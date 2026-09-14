import { PageHeader } from "@/components/ui/PageHeader";
import { AyahForm } from "@/components/forms/AyahForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditAyahPage({ params }: Props) {
  const { id } = await params;
  return (
    <div>
      <PageHeader
        title="Редактировать аят"
        description={`ID: ${id}`}
      />
      <AyahForm mode="edit" id={id} />
    </div>
  );
}
