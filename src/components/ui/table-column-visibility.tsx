'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

type ColumnOption = {
  id: string;
  label: string;
};

type TableColumnVisibilityControlProps = {
  paramKey: string;
  columns: ColumnOption[];
  defaultVisible: string[];
  minVisible?: number;
  triggerLabel?: string;
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

function arraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) {
    return false;
  }

  return a.every((value, index) => value === b[index]);
}

export function TableColumnVisibilityControl({
  paramKey,
  columns,
  defaultVisible,
  minVisible = 1,
  triggerLabel = 'Columns',
}: TableColumnVisibilityControlProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const columnIdSet = useMemo(() => new Set(columns.map((column) => column.id)), [columns]);

  const selectedColumns = useMemo(() => {
    const values = searchParams.getAll(paramKey).filter((value) => columnIdSet.has(value));

    if (values.length === 0) {
      return defaultVisible;
    }

    const valueSet = new Set(values);
    return columns.filter((column) => valueSet.has(column.id)).map((column) => column.id);
  }, [columns, columnIdSet, defaultVisible, paramKey, searchParams]);

  const [draftSelection, setDraftSelection] = useState<string[]>(selectedColumns);

  useEffect(() => {
    setDraftSelection(selectedColumns);
  }, [selectedColumns]);

  useOutsideClick(containerRef, () => setIsOpen(false));

  const toggleColumn = (columnId: string) => {
    setDraftSelection((previous) => {
      const set = new Set(previous);

      if (set.has(columnId)) {
        if (set.size <= minVisible) {
          return previous;
        }

        set.delete(columnId);
      } else {
        set.add(columnId);
      }

      const ordered = columns.filter((column) => set.has(column.id)).map((column) => column.id);

      return ordered.length >= minVisible ? ordered : previous;
    });
  };

  const selectAll = () => {
    setDraftSelection(columns.map((column) => column.id));
  };

  const resetToDefault = () => {
    setDraftSelection(defaultVisible);
  };

  const applySelection = () => {
    if (draftSelection.length < minVisible) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete(paramKey);

    const orderedSelection = columns
      .filter((column) => draftSelection.includes(column.id))
      .map((column) => column.id);

    if (!arraysEqual(orderedSelection, defaultVisible)) {
      orderedSelection.forEach((columnId) => {
        params.append(paramKey, columnId);
      });
    }

    const query = params.toString();
    router.push(query.length ? `${pathname}?${query}` : pathname);
    setIsOpen(false);
  };

  const visibleCount = selectedColumns.length;
  const totalCount = columns.length;
  const hasCustomSelection = !arraysEqual(selectedColumns, defaultVisible);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        className={`inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium transition hover:bg-muted ${
          hasCustomSelection ? 'text-foreground' : 'text-muted-foreground'
        }`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        {triggerLabel}
        <span className="text-xs text-muted-foreground">
          {visibleCount}/{totalCount}
        </span>
      </button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-64 rounded-md border border-border bg-card shadow-lg"
        >
          <div className="border-b border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Visible columns
          </div>
          <div className="max-h-64 space-y-1 overflow-auto px-3 py-2 text-sm">
            {columns.map((column) => {
              const isChecked = draftSelection.includes(column.id);
              const disabled = !isChecked && draftSelection.length <= minVisible;

              return (
                <label
                  key={column.id}
                  className={`flex items-center gap-2 rounded-md px-2 py-1 transition hover:bg-muted ${
                    disabled ? 'opacity-70' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={isChecked}
                    onChange={() => toggleColumn(column.id)}
                    disabled={disabled}
                  />
                  <span className="truncate">{column.label}</span>
                </label>
              );
            })}
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
                onClick={resetToDefault}
              >
                Reset
              </button>
              <button
                type="button"
                className={`rounded-md px-2 py-1 transition ${
                  draftSelection.length >= minVisible
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-muted text-muted-foreground opacity-70'
                }`}
                onClick={applySelection}
                disabled={draftSelection.length < minVisible}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
