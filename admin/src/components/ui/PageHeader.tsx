import Link from "next/link";
import { Button } from "./Button";

type Props = {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
};

export function PageHeader({
  title,
  description,
  actionHref,
  actionLabel,
}: Props) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-[var(--color-muted-fg)]">
            {description}
          </p>
        ) : null}
      </div>
      {actionHref && actionLabel ? (
        <Link href={actionHref}>
          <Button type="button">{actionLabel}</Button>
        </Link>
      ) : null}
    </div>
  );
}
