"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

/** Phase 2: видео скрыто в меню; прямой URL — stub, CRUD не трогаем */
export default function VideosPage() {
  return (
    <div>
      <PageHeader
        title="Видео"
        description="Раздел временно отключён (phase 2)."
      />
      <EmptyState
        title="Видео скоро"
        description="CRUD видео будет подключён после стабилизации auth и контент-модулей. Пункт скрыт в меню."
      />
    </div>
  );
}
