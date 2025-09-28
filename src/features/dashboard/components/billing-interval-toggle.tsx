'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
] as const;

type BillingInterval = (typeof OPTIONS)[number]['value'];

type BillingIntervalToggleProps = {
  paramKey: string;
};

export function BillingIntervalToggle({ paramKey }: BillingIntervalToggleProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentValue = searchParams.get(paramKey);
  const activeValue = OPTIONS.some((option) => option.value === currentValue)
    ? (currentValue as BillingInterval)
    : 'daily';

  const handleSelect = (value: BillingInterval) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === 'daily') {
      params.delete(paramKey);
    } else {
      params.set(paramKey, value);
    }

    const query = params.toString();
    router.push(query.length ? `${pathname}?${query}` : pathname);
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Interval
      </span>
      <div className="inline-flex rounded-md border border-border bg-card p-1 shadow-sm">
        {OPTIONS.map((option) => {
          const isActive = option.value === activeValue;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
