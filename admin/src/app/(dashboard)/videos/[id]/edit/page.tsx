"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

type Props = { params: Promise<{ id: string }> };

export default function EditVideoPage(_props: Props) {
  return (
    <div>
      <PageHeader
        title="Редактировать видео"
        description="Раздел временно отключён (phase 2)."
      />
      <EmptyState
        title="Редактирование недоступно"
        description="CRUD видео будет подключён позже."
        actionHref="/dashboard"
        actionLabel="На панель"
      />
    </div>
  );
}
