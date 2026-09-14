import { PageHeader } from "@/components/ui/PageHeader";
import { AudioForm } from "@/components/forms/AudioForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditAudioPage({ params }: Props) {
  const { id } = await params;
  return (
    <div>
      <PageHeader title="Редактировать аудио" description={`ID: ${id}`} />
      <AudioForm mode="edit" id={id} />
    </div>
  );
}
