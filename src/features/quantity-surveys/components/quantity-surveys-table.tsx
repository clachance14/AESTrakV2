'use client';

import type { ReactNode } from 'react';

import { TableColumnMenu } from '@/components/ui/table-column-menu';
import type { QuantitySurveyColumnId } from '@/features/quantity-surveys/columns';
import {
  DEFAULT_QUANTITY_SURVEY_COLUMN_IDS,
  QUANTITY_SURVEY_COLUMNS,
} from '@/features/quantity-surveys/columns';
import type { QuantitySurveyLogEntry } from '@/features/quantity-surveys/queries';
import {
  DEFAULT_QUANTITY_SURVEY_SORT_KEY,
  getQuantitySurveyDefaultDirection,
  isQuantitySurveySortKey,
} from '@/features/quantity-surveys/sorting';
import {
  getQuantitySurveyStatus,
  type QuantitySurveyStatus,
} from '@/features/quantity-surveys/status';
import type { FilterOption } from '@/libs/filter-utils';
import { formatCurrency, formatDate, formatNullableText } from '@/libs/formatters';

function getStatusVariant(status: QuantitySurveyStatus) {
  switch (status) {
    case 'Accepted':
      return 'bg-emerald-100 text-emerald-700';
    case 'Invoiced':
      return 'bg-blue-100 text-blue-700';
    case 'Transferred':
      return 'bg-amber-100 text-amber-700';
    case 'Pending':
    default:
      return 'bg-slate-200 text-slate-700';
  }
}

function QuantitySurveyStatusBadge({ entry }: { entry: QuantitySurveyLogEntry }) {
  const status = getQuantitySurveyStatus(entry);

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusVariant(status)}`}
    >
      {status}
    </span>
  );
}

export type QuantitySurveyTableFilters = {
  status: FilterOption[];
  purchaseOrder: FilterOption[];
  vendor: FilterOption[];
};

export function QuantitySurveysTable({
  entries,
  filters,
  visibleColumns,
}: {
  entries: QuantitySurveyLogEntry[];
  filters: QuantitySurveyTableFilters;
  visibleColumns: QuantitySurveyColumnId[];
}) {
  const filterOptionsByKey: Record<string, FilterOption[] | undefined> = {
    qsStatus: filters.status,
    qsPurchaseOrder: filters.purchaseOrder,
    qsVendor: filters.vendor,
  };

  const columnRenderers: Record<
    QuantitySurveyColumnId,
    (entry: QuantitySurveyLogEntry) => ReactNode
  > = {
    qsNumber: (entry) => <span className="font-medium">{entry.qsNumber}</span>,
    status: (entry) => <QuantitySurveyStatusBadge entry={entry} />,
    total: (entry) => formatCurrency(entry.total),
    purchaseOrder: (entry) => formatNullableText(entry.purchaseOrderNo),
    description: (entry) => (
      <span className="block max-w-xs break-words text-sm text-foreground">
        {formatNullableText(entry.description)}
      </span>
    ),
    invoiceNumber: (entry) => formatNullableText(entry.invoiceNumber),
    invoiceDate: (entry) => formatDate(entry.invoiceDate, { iso: true }),
    transferDate: (entry) => formatDate(entry.transferDate, { iso: true }),
    acceptedDate: (entry) => formatDate(entry.acceptedDate, { iso: true }),
    vendor: (entry) => (
      <div className="space-y-1">
        <div className="font-medium leading-none">{formatNullableText(entry.vendorShortTerm)}</div>
        <div className="text-xs text-muted-foreground">
          {formatNullableText(entry.contractorContact)}
        </div>
      </div>
    ),
  };

  const cellClassNames: Partial<Record<QuantitySurveyColumnId, string>> = {
    total: 'text-right tabular-nums',
  };

  const visibleColumnSet = new Set(
    visibleColumns.length > 0 ? visibleColumns : DEFAULT_QUANTITY_SURVEY_COLUMN_IDS,
  );
  const columnsToRender = QUANTITY_SURVEY_COLUMNS.filter((column) =>
    visibleColumnSet.has(column.id),
  );

  if (!columnsToRender.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center text-sm text-muted-foreground">
        No columns selected. Update the column picker to view data.
      </div>
    );
  }

  if (!entries.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center text-sm text-muted-foreground">
        No quantity surveys found matching your filters.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <table className="min-w-full border-collapse">
        <thead className="bg-muted uppercase tracking-wide">
          <tr className="text-xs text-muted-foreground">
            {columnsToRender.map((column) => (
              <TableColumnMenu
                key={column.id}
                label={column.label}
                sortKey={column.sortKey}
                isSortKey={column.sortKey ? isQuantitySurveySortKey : undefined}
                defaultSortKey={DEFAULT_QUANTITY_SURVEY_SORT_KEY}
                defaultSortDirection={getQuantitySurveyDefaultDirection(
                  column.sortKey ?? DEFAULT_QUANTITY_SURVEY_SORT_KEY,
                )}
                filterKey={column.filterKey}
                filterOptions={column.filterKey ? filterOptionsByKey[column.filterKey] : undefined}
                align={column.align}
              />
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-sm text-foreground">
          {entries.map((entry) => (
            <tr key={entry.id} className="align-top transition hover:bg-muted">
              {columnsToRender.map((column) => (
                <td
                  key={column.id}
                  className={`px-4 py-3 ${
                    column.align === 'right'
                      ? `text-right ${cellClassNames[column.id] ?? ''}`
                      : (cellClassNames[column.id] ?? '')
                  }`}
                >
                  {columnRenderers[column.id](entry)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
