export type SortDirection = 'asc' | 'desc';

export type SortableValue = string | number | null | undefined;

export function isSortDirection(value: string | null | undefined): value is SortDirection {
  return value === 'asc' || value === 'desc';
}

export function compareSortableValues(
  a: SortableValue,
  b: SortableValue,
  direction: SortDirection,
): number {
  if (Object.is(a, b)) {
    return 0;
  }

  const aIsEmpty =
    a === null || a === undefined || (typeof a === 'string' && a.trim().length === 0);
  const bIsEmpty =
    b === null || b === undefined || (typeof b === 'string' && b.trim().length === 0);

  if (aIsEmpty && bIsEmpty) {
    return 0;
  }

  if (aIsEmpty) {
    return 1;
  }

  if (bIsEmpty) {
    return -1;
  }

  if (typeof a === 'number' && typeof b === 'number') {
    return direction === 'asc' ? a - b : b - a;
  }

  const aString = String(a);
  const bString = String(b);

  const aDate = new Date(aString);
  const bDate = new Date(bString);
  const aDateValid = !Number.isNaN(aDate.getTime());
  const bDateValid = !Number.isNaN(bDate.getTime());

  if (aDateValid && bDateValid) {
    return direction === 'asc'
      ? aDate.getTime() - bDate.getTime()
      : bDate.getTime() - aDate.getTime();
  }

  return direction === 'asc'
    ? aString.localeCompare(bString, undefined, { numeric: true, sensitivity: 'base' })
    : bString.localeCompare(aString, undefined, { numeric: true, sensitivity: 'base' });
}
