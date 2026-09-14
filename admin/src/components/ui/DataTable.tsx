import { EmptyState } from "./EmptyState";

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
};

type Props<T extends { id: string | number }> = {
  columns: Column<T>[];
  rows: T[];
  emptyTitle: string;
  emptyDescription: string;
  emptyActionHref?: string;
  emptyActionLabel?: string;
};

export function DataTable<T extends { id: string | number }>({
  columns,
  rows,
  emptyTitle,
  emptyDescription,
  emptyActionHref,
  emptyActionLabel,
}: Props<T>) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionHref={emptyActionHref}
        actionLabel={emptyActionLabel}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white">
      <table className="min-w-full divide-y divide-[var(--color-border)] text-sm">
        <thead className="bg-[var(--color-muted)]">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left font-medium text-[var(--color-muted-fg)]"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {rows.map((row) => (
            <tr key={String(row.id)} className="hover:bg-[var(--color-surface)]">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3">
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
