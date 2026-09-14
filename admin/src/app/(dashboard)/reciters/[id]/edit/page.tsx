import { PageHeader } from "@/components/ui/PageHeader";
import { ReciterForm } from "@/components/forms/ReciterForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditReciterPage({ params }: Props) {
  const { id } = await params;
  return (
    <div>
      <PageHeader title="Редактировать чтеца" description={`ID: ${id}`} />
      <ReciterForm mode="edit" id={id} />
    </div>
  );
}
