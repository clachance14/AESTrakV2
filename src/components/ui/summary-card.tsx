import type { ReactNode } from 'react';

export type SummaryCardProps = {
  label: string;
  value: ReactNode;
  helperText?: ReactNode;
};

export function SummaryCard({ label, value, helperText }: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="mt-2 text-2xl font-semibold text-foreground">{value}</div>
      {helperText ? <p className="mt-2 text-xs text-muted-foreground">{helperText}</p> : null}
    </div>
  );
}
