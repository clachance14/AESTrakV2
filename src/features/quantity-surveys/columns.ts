import type { QuantitySurveySortKey } from '@/features/quantity-surveys/sorting';

export type QuantitySurveyColumnId =
  | 'qsNumber'
  | 'status'
  | 'total'
  | 'purchaseOrder'
  | 'description'
  | 'invoiceNumber'
  | 'invoiceDate'
  | 'transferDate'
  | 'acceptedDate'
  | 'vendor';

type QuantitySurveyFilterKey = 'qsStatus' | 'qsPurchaseOrder' | 'qsVendor';

export type QuantitySurveyColumnMeta = {
  id: QuantitySurveyColumnId;
  label: string;
  sortKey?: QuantitySurveySortKey;
  filterKey?: QuantitySurveyFilterKey;
  align?: 'left' | 'right';
};

export const QUANTITY_SURVEY_COLUMNS: QuantitySurveyColumnMeta[] = [
  { id: 'qsNumber', label: 'QS Number', sortKey: 'qsNumber' },
  { id: 'status', label: 'Status', sortKey: 'status', filterKey: 'qsStatus' },
  { id: 'total', label: 'Total', sortKey: 'total', align: 'right' },
  {
    id: 'purchaseOrder',
    label: 'PO Number',
    sortKey: 'purchaseOrder',
    filterKey: 'qsPurchaseOrder',
  },
  { id: 'description', label: 'Description', sortKey: 'description' },
  { id: 'invoiceNumber', label: 'Invoice #', sortKey: 'invoiceNumber' },
  { id: 'invoiceDate', label: 'Invoice Date', sortKey: 'invoiceDate' },
  { id: 'transferDate', label: 'Transfer Date', sortKey: 'transferDate' },
  { id: 'acceptedDate', label: 'Accepted Date', sortKey: 'acceptedDate' },
  { id: 'vendor', label: 'Vendor / Contact', sortKey: 'vendor', filterKey: 'qsVendor' },
];

const QUANTITY_SURVEY_COLUMN_ID_SET = new Set(QUANTITY_SURVEY_COLUMNS.map((column) => column.id));

export const DEFAULT_QUANTITY_SURVEY_COLUMN_IDS = QUANTITY_SURVEY_COLUMNS.map(
  (column) => column.id,
);

export function isQuantitySurveyColumnId(
  value: string | null | undefined,
): value is QuantitySurveyColumnId {
  if (!value) {
    return false;
  }

  return QUANTITY_SURVEY_COLUMN_ID_SET.has(value as QuantitySurveyColumnId);
}

export const QUANTITY_SURVEY_COLUMN_OPTIONS = QUANTITY_SURVEY_COLUMNS.map((column) => ({
  id: column.id,
  label: column.label,
}));
