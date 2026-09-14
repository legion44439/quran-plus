import { PageHeader } from "@/components/ui/PageHeader";
import { AudioForm } from "@/components/forms/AudioForm";

export default function NewAudioPage() {
  return (
    <div>
      <PageHeader title="Новое аудио" description="Создание аудиозаписи." />
      <AudioForm mode="create" />
    </div>
  );
}
