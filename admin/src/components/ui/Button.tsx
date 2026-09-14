import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] shadow-sm",
  secondary:
    "bg-[var(--color-gold-soft)] text-[var(--color-primary-dark)] border border-[var(--color-gold)] hover:bg-[var(--color-gold)]/30",
  ghost:
    "bg-transparent text-[var(--color-foreground)] hover:bg-[var(--color-muted)]",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
