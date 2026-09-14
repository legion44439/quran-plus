import Link from "next/link";
import { Button } from "./Button";

type Props = {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
};

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-2xl text-[var(--color-primary)]">
        ◌
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-foreground)]">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-sm text-[var(--color-muted-fg)]">
        {description}
      </p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="mt-6">
          <Button type="button">{actionLabel}</Button>
        </Link>
      ) : null}
    </div>
  );
}
