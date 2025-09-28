import type { PurchaseOrderSortKey } from '@/features/purchase-orders/sorting';

export type PurchaseOrderColumnId =
  | 'poNumber'
  | 'status'
  | 'authorized'
  | 'billed'
  | 'remaining'
  | 'utilization'
  | 'vendor'
  | 'coordinator'
  | 'startDate'
  | 'completionDate';

type PurchaseOrderFilterKey = 'status' | 'vendor' | 'coordinator';

export type PurchaseOrderColumnMeta = {
  id: PurchaseOrderColumnId;
  label: string;
  sortKey?: PurchaseOrderSortKey;
  filterKey?: PurchaseOrderFilterKey;
  align?: 'left' | 'right';
};

export const PURCHASE_ORDER_COLUMNS: PurchaseOrderColumnMeta[] = [
  { id: 'poNumber', label: 'PO Number', sortKey: 'poNumber' },
  { id: 'status', label: 'Status', sortKey: 'status', filterKey: 'status' },
  { id: 'authorized', label: 'Authorized', sortKey: 'authorized', align: 'right' },
  { id: 'billed', label: 'Billed', sortKey: 'billed', align: 'right' },
  { id: 'remaining', label: 'Remaining', sortKey: 'remaining', align: 'right' },
  { id: 'utilization', label: 'Utilization', sortKey: 'utilization', align: 'right' },
  { id: 'vendor', label: 'Vendor', sortKey: 'vendor', filterKey: 'vendor' },
  { id: 'coordinator', label: 'Coordinator', sortKey: 'coordinator', filterKey: 'coordinator' },
  { id: 'startDate', label: 'Start Date', sortKey: 'startDate' },
  { id: 'completionDate', label: 'Completion Date', sortKey: 'completionDate' },
];

const PURCHASE_ORDER_COLUMN_ID_SET = new Set(PURCHASE_ORDER_COLUMNS.map((column) => column.id));

export const DEFAULT_PURCHASE_ORDER_COLUMN_IDS = PURCHASE_ORDER_COLUMNS.map((column) => column.id);

export function isPurchaseOrderColumnId(
  value: string | null | undefined,
): value is PurchaseOrderColumnId {
  if (!value) {
    return false;
  }

  return PURCHASE_ORDER_COLUMN_ID_SET.has(value as PurchaseOrderColumnId);
}

export const PURCHASE_ORDER_COLUMN_OPTIONS = PURCHASE_ORDER_COLUMNS.map((column) => ({
  id: column.id,
  label: column.label,
}));
