import type { PurchaseOrderLogEntry } from '@/features/purchase-orders/queries';
import { compareSortableValues, type SortDirection, type SortableValue } from '@/libs/sorting';

export type PurchaseOrderSortDefinition = {
  selector: (entry: PurchaseOrderLogEntry) => SortableValue;
  defaultDirection: SortDirection;
};

const PURCHASE_ORDER_SORT_DEFINITIONS = {
  created: {
    selector: (entry: PurchaseOrderLogEntry) => entry.createdAt,
    defaultDirection: 'desc',
  },
  poNumber: {
    selector: (entry: PurchaseOrderLogEntry) => entry.purchaseOrderNo,
    defaultDirection: 'asc',
  },
  status: {
    selector: (entry: PurchaseOrderLogEntry) => entry.status,
    defaultDirection: 'asc',
  },
  authorized: {
    selector: (entry: PurchaseOrderLogEntry) => entry.orderValue,
    defaultDirection: 'desc',
  },
  billed: {
    selector: (entry: PurchaseOrderLogEntry) => entry.totalSpent,
    defaultDirection: 'desc',
  },
  remaining: {
    selector: (entry: PurchaseOrderLogEntry) => entry.remainingBudget,
    defaultDirection: 'desc',
  },
  utilization: {
    selector: (entry: PurchaseOrderLogEntry) => entry.utilizationPercent,
    defaultDirection: 'desc',
  },
  vendor: {
    selector: (entry: PurchaseOrderLogEntry) => entry.vendorShortTerm,
    defaultDirection: 'asc',
  },
  coordinator: {
    selector: (entry: PurchaseOrderLogEntry) => entry.workCoordinatorName,
    defaultDirection: 'asc',
  },
  startDate: {
    selector: (entry: PurchaseOrderLogEntry) => entry.startDate,
    defaultDirection: 'desc',
  },
  completionDate: {
    selector: (entry: PurchaseOrderLogEntry) => entry.completionDate,
    defaultDirection: 'desc',
  },
} as const satisfies Record<string, PurchaseOrderSortDefinition>;

export type PurchaseOrderSortKey = keyof typeof PURCHASE_ORDER_SORT_DEFINITIONS;

export const DEFAULT_PURCHASE_ORDER_SORT_KEY: PurchaseOrderSortKey = 'created';

export function isPurchaseOrderSortKey(
  value: string | null | undefined,
): value is PurchaseOrderSortKey {
  if (!value) {
    return false;
  }

  return value in PURCHASE_ORDER_SORT_DEFINITIONS;
}

export function getPurchaseOrderDefaultDirection(sortKey: PurchaseOrderSortKey): SortDirection {
  return PURCHASE_ORDER_SORT_DEFINITIONS[sortKey].defaultDirection;
}

export function sortPurchaseOrders(
  entries: PurchaseOrderLogEntry[],
  sortKey: PurchaseOrderSortKey,
  direction: SortDirection,
): PurchaseOrderLogEntry[] {
  const definition =
    PURCHASE_ORDER_SORT_DEFINITIONS[sortKey] ??
    PURCHASE_ORDER_SORT_DEFINITIONS[DEFAULT_PURCHASE_ORDER_SORT_KEY];

  return entries
    .slice()
    .sort((a, b) =>
      compareSortableValues(definition.selector(a), definition.selector(b), direction),
    );
}
