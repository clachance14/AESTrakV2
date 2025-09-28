const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '—';
  }

  return currencyFormatter.format(value);
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '—';
  }

  return percentFormatter.format(value / 100);
}

export function formatDate(
  value: string | null | undefined,
  { fallback = '—', iso = false } = {},
): string {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  if (iso) {
    return date.toISOString().slice(0, 10);
  }

  return dateFormatter.format(date);
}

export function formatNullableText(value: string | null | undefined, fallback = '—'): string {
  if (!value || value.trim().length === 0) {
    return fallback;
  }

  return value;
}
