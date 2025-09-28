import type { QuantitySurveyLogEntry } from '@/features/quantity-surveys/queries';
import { getQuantitySurveyStatus } from '@/features/quantity-surveys/status';
import { compareSortableValues, type SortDirection, type SortableValue } from '@/libs/sorting';

export type QuantitySurveySortDefinition = {
  selector: (entry: QuantitySurveyLogEntry) => SortableValue;
  defaultDirection: SortDirection;
};

const QUANTITY_SURVEY_SORT_DEFINITIONS = {
  created: {
    selector: (entry: QuantitySurveyLogEntry) => entry.createdAt,
    defaultDirection: 'desc',
  },
  qsNumber: {
    selector: (entry: QuantitySurveyLogEntry) => entry.qsNumber,
    defaultDirection: 'asc',
  },
  status: {
    selector: (entry: QuantitySurveyLogEntry) => getQuantitySurveyStatus(entry),
    defaultDirection: 'asc',
  },
  total: {
    selector: (entry: QuantitySurveyLogEntry) => entry.total,
    defaultDirection: 'desc',
  },
  purchaseOrder: {
    selector: (entry: QuantitySurveyLogEntry) => entry.purchaseOrderNo,
    defaultDirection: 'asc',
  },
  description: {
    selector: (entry: QuantitySurveyLogEntry) => entry.description,
    defaultDirection: 'asc',
  },
  invoiceNumber: {
    selector: (entry: QuantitySurveyLogEntry) => entry.invoiceNumber,
    defaultDirection: 'asc',
  },
  invoiceDate: {
    selector: (entry: QuantitySurveyLogEntry) => entry.invoiceDate,
    defaultDirection: 'desc',
  },
  transferDate: {
    selector: (entry: QuantitySurveyLogEntry) => entry.transferDate,
    defaultDirection: 'desc',
  },
  acceptedDate: {
    selector: (entry: QuantitySurveyLogEntry) => entry.acceptedDate,
    defaultDirection: 'desc',
  },
  vendor: {
    selector: (entry: QuantitySurveyLogEntry) => entry.vendorShortTerm ?? entry.vendorId,
    defaultDirection: 'asc',
  },
} as const satisfies Record<string, QuantitySurveySortDefinition>;

export type QuantitySurveySortKey = keyof typeof QUANTITY_SURVEY_SORT_DEFINITIONS;

export const DEFAULT_QUANTITY_SURVEY_SORT_KEY: QuantitySurveySortKey = 'created';

export function isQuantitySurveySortKey(
  value: string | null | undefined,
): value is QuantitySurveySortKey {
  if (!value) {
    return false;
  }

  return value in QUANTITY_SURVEY_SORT_DEFINITIONS;
}

export function getQuantitySurveyDefaultDirection(sortKey: QuantitySurveySortKey): SortDirection {
  return QUANTITY_SURVEY_SORT_DEFINITIONS[sortKey].defaultDirection;
}

export function sortQuantitySurveys(
  entries: QuantitySurveyLogEntry[],
  sortKey: QuantitySurveySortKey,
  direction: SortDirection,
): QuantitySurveyLogEntry[] {
  const definition =
    QUANTITY_SURVEY_SORT_DEFINITIONS[sortKey] ??
    QUANTITY_SURVEY_SORT_DEFINITIONS[DEFAULT_QUANTITY_SURVEY_SORT_KEY];

  return entries
    .slice()
    .sort((a, b) =>
      compareSortableValues(definition.selector(a), definition.selector(b), direction),
    );
}
