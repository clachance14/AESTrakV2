'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import type { FilterOption } from '@/libs/filter-utils';
import { EMPTY_FILTER_VALUE } from '@/libs/filter-utils';
import type { SortDirection } from '@/libs/sorting';
import { isSortDirection } from '@/libs/sorting';

type ColumnMenuProps = {
  label: ReactNode;
  sortKey?: string;
  isSortKey?: (value: string | null | undefined) => boolean;
  defaultSortKey: string;
  defaultSortDirection: SortDirection;
  filterKey?: string;
  filterOptions?: FilterOption[];
  align?: 'left' | 'right';
};

function useOutsideClick<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: () => void,
) {
  useEffect(() => {
    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (!ref.current) {
        return;
      }

      if (!ref.current.contains(event.target as Node)) {
        handler();
      }
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [handler, ref]);
}

export function TableColumnMenu({
  label,
  sortKey,
  isSortKey,
  defaultSortKey,
  defaultSortDirection,
  filterKey,
  filterOptions,
  align = 'left',
}: ColumnMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLTableHeaderCellElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const isFilterable = Boolean(filterKey && filterOptions && filterOptions.length > 0);
  const isSortable = Boolean(sortKey && isSortKey);

  const currentSortKey = useMemo(() => {
    const rawSort = searchParams.get('sort');

    if (rawSort && isSortKey && isSortKey(rawSort)) {
      return rawSort;
    }

    return defaultSortKey;
  }, [defaultSortKey, isSortKey, searchParams]);

  const currentSortDirection = useMemo<SortDirection>(() => {
    const rawDirection = searchParams.get('direction');

    if (rawDirection && isSortDirection(rawDirection)) {
      return rawDirection;
    }

    return defaultSortDirection;
  }, [defaultSortDirection, searchParams]);

  const selectedFilterValues = useMemo(() => {
    if (!filterKey || !filterOptions) {
      return [] as string[];
    }

    const values = searchParams.getAll(filterKey);

    if (values.length === 0) {
      return filterOptions.map((option) => option.value);
    }

    return values;
  }, [filterKey, filterOptions, searchParams]);

  const [draftFilterValues, setDraftFilterValues] = useState<string[]>(selectedFilterValues);

  useEffect(() => {
    setDraftFilterValues(selectedFilterValues);
  }, [selectedFilterValues]);

  useOutsideClick(containerRef, () => setIsOpen(false));

  const isSortActive = sortKey ? sortKey === currentSortKey : false;
  const isFilterActive = filterKey
    ? selectedFilterValues.length > 0 &&
      selectedFilterValues.length !== (filterOptions?.length ?? 0)
    : false;

  const toggleValue = (value: string) => {
    setDraftFilterValues((previous) => {
      const next = new Set(previous);

      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }

      return Array.from(next);
    });
  };

  const selectAll = () => {
    if (!filterOptions) {
      return;
    }

    setDraftFilterValues(filterOptions.map((option) => option.value));
  };

  const clearFilter = () => {
    if (!filterOptions) {
      return;
    }

    setDraftFilterValues(filterOptions.map((option) => option.value));

    if (!filterKey) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete(filterKey);
    const query = params.toString();
    router.push(query.length ? `${pathname}?${query}` : pathname);
    setIsOpen(false);
  };

  const applyFilter = () => {
    if (!filterKey) {
      setIsOpen(false);
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete(filterKey);

    if (filterOptions && draftFilterValues.length === 0) {
      setIsOpen(false);
      return;
    }

    if (filterOptions && draftFilterValues.length < filterOptions.length) {
      draftFilterValues.forEach((value) => {
        params.append(filterKey, value);
      });
    }

    const query = params.toString();
    router.push(query.length ? `${pathname}?${query}` : pathname);
    setIsOpen(false);
  };

  const applySort = (direction: SortDirection) => {
    if (!sortKey) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', sortKey);
    params.set('direction', direction);

    const query = params.toString();
    router.push(query.length ? `${pathname}?${query}` : pathname);
    setIsOpen(false);
  };

  const clearSort = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('sort');
    params.delete('direction');
    const query = params.toString();
    router.push(query.length ? `${pathname}?${query}` : pathname);
    setIsOpen(false);
  };

  const alignmentClass = align === 'right' ? 'text-right' : 'text-left';
  const menuAlignment = align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left';

  const draftSelectionSet = useMemo(() => new Set(draftFilterValues), [draftFilterValues]);
  const canApplyFilter = !isFilterable || draftFilterValues.length > 0;

  return (
    <th
      ref={containerRef}
      scope="col"
      className={`relative px-4 py-3 text-xs font-semibold uppercase tracking-wide ${alignmentClass}`}
    >
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        className={`group inline-flex w-full items-center justify-between gap-2 rounded-md px-2 py-1 text-sm font-medium transition hover:bg-muted/70 ${
          isSortActive || isFilterActive ? 'text-foreground' : 'text-muted-foreground'
        }`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <span className="truncate text-left">{label}</span>
        <span
          className={`text-xs ${isFilterActive ? 'text-primary' : 'text-muted-foreground'} group-hover:text-foreground`}
        >
          ▾
        </span>
      </button>

      {isOpen ? (
        <div
          role="menu"
          className={`absolute z-30 mt-2 w-56 rounded-md border border-border bg-card shadow-lg ${menuAlignment}`}
        >
          <div className="border-b border-border px-3 py-2 text-xs font-semibold text-muted-foreground">
            Sort
          </div>
          <div className="space-y-1 px-3 py-2 text-sm">
            <button
              type="button"
              className={`flex w-full items-center justify-between rounded-md px-2 py-1 text-left transition hover:bg-muted ${
                isSortActive && currentSortDirection === 'asc'
                  ? 'bg-muted font-semibold text-foreground'
                  : ''
              } ${isSortable ? '' : 'pointer-events-none opacity-50'}`}
              onClick={() => applySort('asc')}
              disabled={!isSortable}
            >
              <span>Sort ascending</span>
              <span className="text-xs text-muted-foreground">▲</span>
            </button>
            <button
              type="button"
              className={`flex w-full items-center justify-between rounded-md px-2 py-1 text-left transition hover:bg-muted ${
                isSortActive && currentSortDirection === 'desc'
                  ? 'bg-muted font-semibold text-foreground'
                  : ''
              } ${isSortable ? '' : 'pointer-events-none opacity-50'}`}
              onClick={() => applySort('desc')}
              disabled={!isSortable}
            >
              <span>Sort descending</span>
              <span className="text-xs text-muted-foreground">▼</span>
            </button>
            <button
              type="button"
              className="w-full rounded-md px-2 py-1 text-left text-xs text-muted-foreground transition hover:bg-muted"
              onClick={clearSort}
            >
              Clear sort
            </button>
          </div>

          {isFilterable ? (
            <>
              <div className="border-y border-border px-3 py-2 text-xs font-semibold text-muted-foreground">
                Filter
              </div>
              <div className="max-h-48 space-y-1 overflow-auto px-3 py-2 text-sm">
                {filterOptions?.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 rounded-md px-2 py-1 transition hover:bg-muted"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={draftSelectionSet.has(option.value)}
                      onChange={() => toggleValue(option.value)}
                    />
                    <span className="truncate text-sm">
                      {option.label}
                      {option.value === EMPTY_FILTER_VALUE ? ' (blank)' : ''}
                    </span>
                  </label>
                ))}
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2 text-xs">
                <button
                  type="button"
                  className="rounded-md px-2 py-1 text-muted-foreground transition hover:bg-muted"
                  onClick={selectAll}
                >
                  Select all
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-md px-2 py-1 text-muted-foreground transition hover:bg-muted"
                    onClick={clearFilter}
                  >
                    Clear filter
                  </button>
                  <button
                    type="button"
                    className={`rounded-md px-2 py-1 transition ${
                      canApplyFilter
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-muted text-muted-foreground opacity-70'
                    }`}
                    onClick={applyFilter}
                    disabled={!canApplyFilter}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </th>
  );
}
