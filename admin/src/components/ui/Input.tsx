import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export function Input({ label, hint, id, className = "", ...rest }: InputProps) {
  const inputId = id ?? rest.name;
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-[var(--color-foreground)]">{label}</span>
      <input
        id={inputId}
        className={`rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 ${className}`}
        {...rest}
      />
      {hint ? (
        <span className="text-xs text-[var(--color-muted-fg)]">{hint}</span>
      ) : null}
    </label>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
};

export function Textarea({
  label,
  hint,
  id,
  className = "",
  ...rest
}: TextareaProps) {
  const inputId = id ?? rest.name;
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-[var(--color-foreground)]">{label}</span>
      <textarea
        id={inputId}
        className={`min-h-[100px] rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 ${className}`}
        {...rest}
      />
      {hint ? (
        <span className="text-xs text-[var(--color-muted-fg)]">{hint}</span>
      ) : null}
    </label>
  );
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: { value: string; label: string }[];
  hint?: string;
};

export function Select({
  label,
  options,
  hint,
  id,
  className = "",
  ...rest
}: SelectProps) {
  const inputId = id ?? rest.name;
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-[var(--color-foreground)]">{label}</span>
      <select
        id={inputId}
        className={`rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 ${className}`}
        {...rest}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint ? (
        <span className="text-xs text-[var(--color-muted-fg)]">{hint}</span>
      ) : null}
    </label>
  );
}
