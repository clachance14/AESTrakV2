'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type PurchaseOrderDateFiltersProps = {
  fromParam: string;
  toParam: string;
};

function formatDate(date: Date): string {
  const iso = date.toISOString();
  return iso.slice(0, 10);
}

export function PurchaseOrderDateFilters({ fromParam, toParam }: PurchaseOrderDateFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialFrom = searchParams.get(fromParam) ?? '';
  const initialTo = searchParams.get(toParam) ?? '';

  const [fromDate, setFromDate] = useState(initialFrom);
  const [toDate, setToDate] = useState(initialTo);

  useEffect(() => {
    setFromDate(initialFrom);
    setToDate(initialTo);
  }, [initialFrom, initialTo]);

  const isDirty = useMemo(
    () => fromDate !== initialFrom || toDate !== initialTo,
    [fromDate, toDate, initialFrom, initialTo],
  );

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (fromDate) {
      params.set(fromParam, fromDate);
    } else {
      params.delete(fromParam);
    }

    if (toDate) {
      params.set(toParam, toDate);
    } else {
      params.delete(toParam);
    }

    const query = params.toString();
    router.push(query.length ? `${pathname}?${query}` : pathname);
  };

  const clearFilters = () => {
    setFromDate('');
    setToDate('');

    const params = new URLSearchParams(searchParams.toString());
    params.delete(fromParam);
    params.delete(toParam);
    const query = params.toString();
    router.push(query.length ? `${pathname}?${query}` : pathname);
  };

  const disableApply = Boolean(fromDate && toDate && fromDate > toDate);

  // Function to check if a quick range is currently active
  const isQuickRangeActive = (days: number | 'ytd'): boolean => {
    if (!initialFrom || !initialTo) return false;

    const today = new Date();
    let expectedFrom: Date;
    const expectedTo = today;

    if (days === 'ytd') {
      expectedFrom = new Date(today.getFullYear(), 0, 1);
    } else {
      expectedFrom = new Date();
      expectedFrom.setDate(expectedFrom.getDate() - days);
    }

    const expectedFromValue = formatDate(expectedFrom);
    const expectedToValue = formatDate(expectedTo);

    return initialFrom === expectedFromValue && initialTo === expectedToValue;
  };

  const applyQuickRange = (days: number | 'ytd') => {
    const today = new Date();
    let from: Date;
    const to = today;

    if (days === 'ytd') {
      from = new Date(today.getFullYear(), 0, 1);
    } else {
      from = new Date();
      from.setDate(from.getDate() - days);
    }

    const fromValue = formatDate(from);
    const toValue = formatDate(to);

    setFromDate(fromValue);
    setToDate(toValue);

    const params = new URLSearchParams(searchParams.toString());
    params.set(fromParam, fromValue);
    params.set(toParam, toValue);
    const query = params.toString();
    router.push(query.length ? `${pathname}?${query}` : pathname);
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Quick range
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`rounded-md border px-2 py-1 text-xs font-semibold transition ${
              isQuickRangeActive(30)
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'border-border text-muted-foreground hover:bg-muted'
            }`}
            onClick={() => applyQuickRange(30)}
          >
            30 days
          </button>
          <button
            type="button"
            className={`rounded-md border px-2 py-1 text-xs font-semibold transition ${
              isQuickRangeActive(60)
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'border-border text-muted-foreground hover:bg-muted'
            }`}
            onClick={() => applyQuickRange(60)}
          >
            60 days
          </button>
          <button
            type="button"
            className={`rounded-md border px-2 py-1 text-xs font-semibold transition ${
              isQuickRangeActive(90)
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'border-border text-muted-foreground hover:bg-muted'
            }`}
            onClick={() => applyQuickRange(90)}
          >
            90 days
          </button>
          <button
            type="button"
            className={`rounded-md border px-2 py-1 text-xs font-semibold transition ${
              isQuickRangeActive('ytd')
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'border-border text-muted-foreground hover:bg-muted'
            }`}
            onClick={() => applyQuickRange('ytd')}
          >
            YTD
          </button>
        </div>
      </div>
      <div className="flex flex-col">
        <label
          htmlFor="po-date-from"
          className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Start date from
        </label>
        <input
          id="po-date-from"
          type="date"
          value={fromDate}
          onChange={(event) => setFromDate(event.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          max={toDate || undefined}
        />
      </div>
      <div className="flex flex-col">
        <label
          htmlFor="po-date-to"
          className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Start date to
        </label>
        <input
          id="po-date-to"
          type="date"
          value={toDate}
          onChange={(event) => setToDate(event.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          min={fromDate || undefined}
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={applyFilters}
          disabled={disableApply || !isDirty}
          className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
            disableApply || !isDirty
              ? 'bg-muted text-muted-foreground opacity-70'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          Apply
        </button>
        <button
          type="button"
          onClick={clearFilters}
          disabled={!initialFrom && !initialTo}
          className="rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted disabled:opacity-60"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
