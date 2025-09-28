export const EMPTY_FILTER_VALUE = '__EMPTY__';

export type FilterOption = {
  value: string;
  label: string;
};

export function toFilterValue(raw: string | null | undefined): string {
  if (!raw) {
    return EMPTY_FILTER_VALUE;
  }

  const trimmed = raw.trim();

  return trimmed.length > 0 ? trimmed : EMPTY_FILTER_VALUE;
}

export function toFilterLabel(raw: string | null | undefined): string {
  if (!raw) {
    return '—';
  }

  const trimmed = raw.trim();

  return trimmed.length > 0 ? trimmed : '—';
}

export function buildFilterOptions(values: Array<string | null | undefined>): FilterOption[] {
  const seen = new Map<string, string>();

  values.forEach((raw) => {
    const value = toFilterValue(raw);

    if (!seen.has(value)) {
      seen.set(value, value === EMPTY_FILTER_VALUE ? '—' : toFilterLabel(raw));
    }
  });

  return Array.from(seen.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
}

export function filterMatchesValue(
  raw: string | null | undefined,
  selectedValues: string[] | undefined,
): boolean {
  if (!selectedValues || selectedValues.length === 0) {
    return true;
  }

  const value = toFilterValue(raw);
  return selectedValues.includes(value);
}
