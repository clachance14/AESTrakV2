import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { SummaryCard } from '@/components/ui/summary-card';
import { TableColumnVisibilityControl } from '@/components/ui/table-column-visibility';
import { getActiveOrganization } from '@/features/organizations/queries';
import {
  DEFAULT_PURCHASE_ORDER_COLUMN_IDS,
  PURCHASE_ORDER_COLUMN_OPTIONS,
  PURCHASE_ORDER_COLUMNS,
  isPurchaseOrderColumnId,
  type PurchaseOrderColumnId,
} from '@/features/purchase-orders/columns';
import { PurchaseOrderDateFilters } from '@/features/purchase-orders/components/purchase-order-date-filters';
import { PurchaseOrdersTable } from '@/features/purchase-orders/components/purchase-orders-table';
import { getPurchaseOrdersForOrganization } from '@/features/purchase-orders/queries';
import {
  DEFAULT_PURCHASE_ORDER_SORT_KEY,
  getPurchaseOrderDefaultDirection,
  isPurchaseOrderSortKey,
  sortPurchaseOrders,
  type PurchaseOrderSortKey,
} from '@/features/purchase-orders/sorting';
import { buildFilterOptions, filterMatchesValue } from '@/libs/filter-utils';
import { formatPercent } from '@/libs/formatters';
import { isSortDirection, type SortDirection } from '@/libs/sorting';

export const metadata: Metadata = {
  title: 'Purchase orders – AESTrak',
};

const processingStatusMatchers = new Set([
  'processing',
  'in process',
  'in-progress',
  'in progress',
]);
const numberFormatter = new Intl.NumberFormat('en-US');

type PurchaseOrdersPageSearchParams =
  | Record<string, string | string[] | undefined>
  | Promise<Record<string, string | string[] | undefined>>
  | undefined;

function getSingleParamValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function getParamValues(value: string | string[] | undefined): string[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function parseDate(value: string | undefined): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

export default async function PurchaseOrdersPage({
  searchParams,
}: {
  searchParams?: PurchaseOrdersPageSearchParams;
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const rawSortParam = getSingleParamValue(resolvedSearchParams.sort);
  const sortKey: PurchaseOrderSortKey = isPurchaseOrderSortKey(rawSortParam)
    ? rawSortParam
    : DEFAULT_PURCHASE_ORDER_SORT_KEY;
  const rawDirectionParam = getSingleParamValue(resolvedSearchParams.direction);
  const defaultDirection = getPurchaseOrderDefaultDirection(sortKey);
  const sortDirection: SortDirection = isSortDirection(rawDirectionParam)
    ? rawDirectionParam
    : defaultDirection;

  const activeContext = await getActiveOrganization();

  if (!activeContext) {
    redirect('/login');
  }

  const purchaseOrders = await getPurchaseOrdersForOrganization(
    activeContext.membership.organizationId,
  );

  const statusFilters = getParamValues(resolvedSearchParams.status);
  const vendorFilters = getParamValues(resolvedSearchParams.vendor);
  const coordinatorFilters = getParamValues(resolvedSearchParams.coordinator);
  const columnFilters = getParamValues(resolvedSearchParams.poColumns);
  const startDateFrom = parseDate(getSingleParamValue(resolvedSearchParams.poStartDateFrom));
  const startDateTo = parseDate(getSingleParamValue(resolvedSearchParams.poStartDateTo));
  const hasActiveFilters =
    statusFilters.length > 0 ||
    vendorFilters.length > 0 ||
    coordinatorFilters.length > 0 ||
    Boolean(startDateFrom) ||
    Boolean(startDateTo);

  const requestedColumns = columnFilters
    .filter((value): value is PurchaseOrderColumnId => isPurchaseOrderColumnId(value))
    .reduce<PurchaseOrderColumnId[]>((accumulator, value) => {
      if (!accumulator.includes(value)) {
        accumulator.push(value);
      }

      return accumulator;
    }, []);

  const visibleColumns = (() => {
    if (requestedColumns.length === 0) {
      return DEFAULT_PURCHASE_ORDER_COLUMN_IDS;
    }

    const requestedSet = new Set<PurchaseOrderColumnId>(requestedColumns);
    const ordered = PURCHASE_ORDER_COLUMNS.filter((column) => requestedSet.has(column.id)).map(
      (column) => column.id,
    );

    return ordered.length > 0 ? ordered : DEFAULT_PURCHASE_ORDER_COLUMN_IDS;
  })();

  const filteredPurchaseOrders = purchaseOrders.filter((po) => {
    const statusMatches = filterMatchesValue(po.status, statusFilters);
    const vendorMatches = filterMatchesValue(po.vendorShortTerm, vendorFilters);
    const coordinatorMatches = filterMatchesValue(po.workCoordinatorName, coordinatorFilters);
    const startDateValue = po.startDate ? new Date(po.startDate) : null;

    if (startDateFrom && (!startDateValue || startDateValue < startDateFrom)) {
      return false;
    }

    if (startDateTo && (!startDateValue || startDateValue > startDateTo)) {
      return false;
    }

    return statusMatches && vendorMatches && coordinatorMatches;
  });

  const sortedPurchaseOrders = sortPurchaseOrders(filteredPurchaseOrders, sortKey, sortDirection);

  const statusOptions = buildFilterOptions(purchaseOrders.map((po) => po.status));
  const vendorOptions = buildFilterOptions(purchaseOrders.map((po) => po.vendorShortTerm));
  const coordinatorOptions = buildFilterOptions(purchaseOrders.map((po) => po.workCoordinatorName));

  const totalCount = filteredPurchaseOrders.length;
  const processingCount = filteredPurchaseOrders.filter((po) =>
    processingStatusMatchers.has(po.status.trim().toLowerCase()),
  ).length;
  const highUtilizationCount = filteredPurchaseOrders.filter(
    (po) => (po.utilizationPercent ?? 0) >= 90,
  ).length;
  const averageUtilization =
    totalCount > 0
      ? filteredPurchaseOrders.reduce((sum, po) => sum + (po.utilizationPercent ?? 0), 0) /
        totalCount
      : null;

  const latestRecordsHelper =
    totalCount === 0
      ? 'No purchase orders available yet. Import PO data to get started.'
      : `Loaded ${numberFormatter.format(totalCount)} record${totalCount === 1 ? '' : 's'}${
          hasActiveFilters ? ' after filters.' : '.'
        }`;
  const processingHelper = 'Awaiting completion or additional QS reconciliation.';
  const utilizationHelper = 'Across purchase orders shown in this view.';
  const highUtilizationHelper = 'Monitor closely for change orders or additional approvals.';

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">Logs / Purchase Orders</div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Purchase Orders</h1>
          <p className="text-sm text-muted-foreground">
            Latest purchase orders for {activeContext.membership.organizationName}. Figures shown in
            USD.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total purchase orders"
          value={numberFormatter.format(totalCount)}
          helperText={latestRecordsHelper}
        />
        <SummaryCard
          label="Processing"
          value={numberFormatter.format(processingCount)}
          helperText={processingHelper}
        />
        <SummaryCard
          label="Average utilization"
          value={averageUtilization !== null ? formatPercent(averageUtilization) : '—'}
          helperText={utilizationHelper}
        />
        <SummaryCard
          label="≥90% utilized"
          value={numberFormatter.format(highUtilizationCount)}
          helperText={highUtilizationHelper}
        />
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <PurchaseOrderDateFilters fromParam="poStartDateFrom" toParam="poStartDateTo" />
        <TableColumnVisibilityControl
          paramKey="poColumns"
          columns={PURCHASE_ORDER_COLUMN_OPTIONS}
          defaultVisible={DEFAULT_PURCHASE_ORDER_COLUMN_IDS}
        />
      </div>

      <PurchaseOrdersTable
        purchaseOrders={sortedPurchaseOrders}
        organizationId={activeContext.membership.organizationId}
        filters={{
          status: statusOptions,
          vendor: vendorOptions,
          coordinator: coordinatorOptions,
        }}
        visibleColumns={visibleColumns}
      />
    </div>
  );
}
