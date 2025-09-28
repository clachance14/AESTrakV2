'use client';

import type { ReactNode } from 'react';

import { TableColumnMenu } from '@/components/ui/table-column-menu';
import type { PurchaseOrderColumnId } from '@/features/purchase-orders/columns';
import {
  DEFAULT_PURCHASE_ORDER_COLUMN_IDS,
  PURCHASE_ORDER_COLUMNS,
} from '@/features/purchase-orders/columns';
import { PurchaseOrderExpandableRow } from '@/features/purchase-orders/components/purchase-order-expandable-row';
import type { PurchaseOrderLogEntry } from '@/features/purchase-orders/queries';
import {
  DEFAULT_PURCHASE_ORDER_SORT_KEY,
  getPurchaseOrderDefaultDirection,
  isPurchaseOrderSortKey,
} from '@/features/purchase-orders/sorting';
import type { FilterOption } from '@/libs/filter-utils';
import { formatCurrency, formatDate, formatNullableText, formatPercent } from '@/libs/formatters';

function getStatusVariant(status: string) {
  const normalized = status.trim().toLowerCase();

  switch (normalized) {
    case 'imported':
      return 'bg-blue-100 text-blue-700';
    case 'processing':
      return 'bg-amber-100 text-amber-700';
    case 'completed':
      return 'bg-emerald-100 text-emerald-700';
    case 'sap canceled':
    case 'cancelled':
      return 'bg-slate-200 text-slate-700';
    case 'closed':
    case 'archived':
      return 'bg-slate-100 text-slate-600';
    default:
      return 'bg-muted text-foreground';
  }
}

function getUtilizationVariant(utilizationPercent: number | null | undefined) {
  if (utilizationPercent === null || utilizationPercent === undefined) {
    return 'bg-muted text-foreground';
  }

  if (utilizationPercent >= 110) {
    return 'bg-rose-100 text-rose-700';
  }

  if (utilizationPercent >= 90) {
    return 'bg-amber-100 text-amber-700';
  }

  if (utilizationPercent >= 75) {
    return 'bg-yellow-100 text-yellow-700';
  }

  return 'bg-emerald-100 text-emerald-700';
}

function PurchaseOrderStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusVariant(status)}`}
    >
      {status || 'Unknown'}
    </span>
  );
}

function UtilizationBadge({ value }: { value: number | null | undefined }) {
  return (
    <span
      className={`inline-flex items-center justify-end rounded-full px-2.5 py-1 text-xs font-semibold ${getUtilizationVariant(value)}`}
    >
      {formatPercent(value ?? null)}
    </span>
  );
}

export type PurchaseOrderTableFilters = {
  status: FilterOption[];
  vendor: FilterOption[];
  coordinator: FilterOption[];
};

export function PurchaseOrdersTable({
  purchaseOrders,
  organizationId,
  filters,
  visibleColumns,
}: {
  purchaseOrders: PurchaseOrderLogEntry[];
  organizationId: string;
  filters: PurchaseOrderTableFilters;
  visibleColumns: PurchaseOrderColumnId[];
}) {
  const filterOptionsByKey: Record<string, FilterOption[] | undefined> = {
    status: filters.status,
    vendor: filters.vendor,
    coordinator: filters.coordinator,
  };

  const columnRenderers: Record<
    PurchaseOrderColumnId,
    (entry: PurchaseOrderLogEntry) => ReactNode
  > = {
    poNumber: (entry) => <span className="font-medium">{entry.purchaseOrderNo}</span>,
    status: (entry) => <PurchaseOrderStatusBadge status={entry.status} />,
    authorized: (entry) => formatCurrency(entry.orderValue),
    billed: (entry) => formatCurrency(entry.totalSpent),
    remaining: (entry) => formatCurrency(entry.remainingBudget),
    utilization: (entry) => <UtilizationBadge value={entry.utilizationPercent} />,
    vendor: (entry) => formatNullableText(entry.vendorShortTerm),
    coordinator: (entry) => formatNullableText(entry.workCoordinatorName),
    startDate: (entry) => formatDate(entry.startDate, { iso: true }),
    completionDate: (entry) => formatDate(entry.completionDate, { iso: true }),
  };

  const cellClassNames: Partial<Record<PurchaseOrderColumnId, string>> = {
    authorized: 'text-right tabular-nums',
    billed: 'text-right tabular-nums',
    remaining: 'text-right tabular-nums',
    utilization: 'text-right',
  };

  const visibleColumnSet = new Set(
    visibleColumns.length > 0 ? visibleColumns : DEFAULT_PURCHASE_ORDER_COLUMN_IDS,
  );
  const columnsToRender = PURCHASE_ORDER_COLUMNS.filter((column) =>
    visibleColumnSet.has(column.id),
  );

  if (!columnsToRender.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center text-sm text-muted-foreground">
        No columns selected. Update the column picker to view data.
      </div>
    );
  }

  if (!purchaseOrders.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center text-sm text-muted-foreground">
        No purchase orders found matching your filters.
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
                isSortKey={column.sortKey ? isPurchaseOrderSortKey : undefined}
                defaultSortKey={DEFAULT_PURCHASE_ORDER_SORT_KEY}
                defaultSortDirection={getPurchaseOrderDefaultDirection(
                  column.sortKey ?? DEFAULT_PURCHASE_ORDER_SORT_KEY,
                )}
                filterKey={column.filterKey}
                filterOptions={column.filterKey ? filterOptionsByKey[column.filterKey] : undefined}
                align={column.align}
              />
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-sm text-foreground">
          {purchaseOrders.map((po) => (
            <PurchaseOrderExpandableRow
              key={po.id}
              purchaseOrder={po}
              organizationId={organizationId}
              columnsToRender={columnsToRender}
              columnRenderers={columnRenderers}
              cellClassNames={cellClassNames}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
