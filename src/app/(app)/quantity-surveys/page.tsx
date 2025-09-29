import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { SummaryCard } from '@/components/ui/summary-card';
import { TableColumnVisibilityControl } from '@/components/ui/table-column-visibility';
import { getActiveOrganization } from '@/features/organizations/queries';
import {
  DEFAULT_QUANTITY_SURVEY_COLUMN_IDS,
  QUANTITY_SURVEY_COLUMN_OPTIONS,
  QUANTITY_SURVEY_COLUMNS,
  isQuantitySurveyColumnId,
  type QuantitySurveyColumnId,
} from '@/features/quantity-surveys/columns';
import { QuantitySurveysTable } from '@/features/quantity-surveys/components/quantity-surveys-table';
import { getQuantitySurveysForOrganization } from '@/features/quantity-surveys/queries';
import {
  DEFAULT_QUANTITY_SURVEY_SORT_KEY,
  getQuantitySurveyDefaultDirection,
  isQuantitySurveySortKey,
  sortQuantitySurveys,
  type QuantitySurveySortKey,
} from '@/features/quantity-surveys/sorting';
import { getQuantitySurveyStatus } from '@/features/quantity-surveys/status';
import { buildFilterOptions, filterMatchesValue } from '@/libs/filter-utils';
import { formatCurrency, formatDate } from '@/libs/formatters';
import { isSortDirection, type SortDirection } from '@/libs/sorting';

export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: 'Quantity surveys – AESTrak',
};

const numberFormatter = new Intl.NumberFormat('en-US');

type QuantitySurveysPageSearchParams =
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

export default async function QuantitySurveysPage({
  searchParams,
}: {
  searchParams?: QuantitySurveysPageSearchParams;
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const rawSortParam = getSingleParamValue(resolvedSearchParams.sort);
  const sortKey: QuantitySurveySortKey = isQuantitySurveySortKey(rawSortParam)
    ? rawSortParam
    : DEFAULT_QUANTITY_SURVEY_SORT_KEY;
  const rawDirectionParam = getSingleParamValue(resolvedSearchParams.direction);
  const defaultDirection = getQuantitySurveyDefaultDirection(sortKey);
  const sortDirection: SortDirection = isSortDirection(rawDirectionParam)
    ? rawDirectionParam
    : defaultDirection;

  const activeContext = await getActiveOrganization();

  if (!activeContext) {
    redirect('/login');
  }

  const quantitySurveys = await getQuantitySurveysForOrganization(
    activeContext.membership.organizationId,
  );

  const statusFilters = getParamValues(resolvedSearchParams.qsStatus);
  const purchaseOrderFilters = getParamValues(resolvedSearchParams.qsPurchaseOrder);
  const vendorFilters = getParamValues(resolvedSearchParams.qsVendor);
  const columnFilters = getParamValues(resolvedSearchParams.qsColumns);
  const hasActiveFilters =
    statusFilters.length > 0 || purchaseOrderFilters.length > 0 || vendorFilters.length > 0;

  const requestedColumns = columnFilters
    .filter((value): value is QuantitySurveyColumnId => isQuantitySurveyColumnId(value))
    .reduce<QuantitySurveyColumnId[]>((accumulator, value) => {
      if (!accumulator.includes(value)) {
        accumulator.push(value);
      }

      return accumulator;
    }, []);

  const visibleColumns = (() => {
    if (requestedColumns.length === 0) {
      return DEFAULT_QUANTITY_SURVEY_COLUMN_IDS;
    }

    const requestedSet = new Set<QuantitySurveyColumnId>(requestedColumns);
    const ordered = QUANTITY_SURVEY_COLUMNS.filter((column) => requestedSet.has(column.id)).map(
      (column) => column.id,
    );

    return ordered.length > 0 ? ordered : DEFAULT_QUANTITY_SURVEY_COLUMN_IDS;
  })();

  const filteredQuantitySurveys = quantitySurveys.filter((entry) => {
    const statusMatches = filterMatchesValue(getQuantitySurveyStatus(entry), statusFilters);
    const poMatches = filterMatchesValue(entry.purchaseOrderNo, purchaseOrderFilters);
    const vendorMatches = filterMatchesValue(
      entry.vendorShortTerm ?? entry.vendorId,
      vendorFilters,
    );

    return statusMatches && poMatches && vendorMatches;
  });

  const sortedQuantitySurveys = sortQuantitySurveys(
    filteredQuantitySurveys,
    sortKey,
    sortDirection,
  );

  const statusOptions = buildFilterOptions(
    quantitySurveys.map((entry) => getQuantitySurveyStatus(entry)),
  );
  const purchaseOrderOptions = buildFilterOptions(
    quantitySurveys.map((entry) => entry.purchaseOrderNo),
  );
  const vendorOptions = buildFilterOptions(
    quantitySurveys.map((entry) => entry.vendorShortTerm ?? entry.vendorId),
  );

  const totalCount = filteredQuantitySurveys.length;
  const acceptedCount = filteredQuantitySurveys.filter((entry) =>
    Boolean(entry.acceptedDate),
  ).length;
  const invoicedCount = filteredQuantitySurveys.filter((entry) =>
    Boolean(entry.invoiceNumber || entry.invoiceDate),
  ).length;
  const aggregateTotal = filteredQuantitySurveys.reduce(
    (sum, entry) => sum + (entry.total ?? 0),
    0,
  );
  const mostRecentTransfer = filteredQuantitySurveys.reduce<string | null>((latest, entry) => {
    if (!entry.transferDate) {
      return latest;
    }

    if (!latest) {
      return entry.transferDate;
    }

    return new Date(entry.transferDate) > new Date(latest) ? entry.transferDate : latest;
  }, null);

  const totalHelper =
    totalCount === 0
      ? 'No quantity surveys available yet. Import QS data to populate this view.'
      : totalCount === 100
        ? `Latest 100 entries. Most recent transfer ${formatDate(mostRecentTransfer, { iso: true })}.`
        : `Loaded ${numberFormatter.format(totalCount)} entr${totalCount === 1 ? 'y' : 'ies'}${
            hasActiveFilters ? ' after filters' : ''
          }. Most recent transfer ${formatDate(mostRecentTransfer, { iso: true })}.`;

  const acceptedHelper = 'Entries with an accepted date recorded.';
  const invoicedHelper = 'Quantity surveys linked to an invoice number or date.';
  const aggregateHelper = 'Combined billed amount across records shown here.';

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">Logs / Quantity Surveys</div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Quantity Surveys</h1>
          <p className="text-sm text-muted-foreground">
            Latest quantity surveys for {activeContext.membership.organizationName}. Figures shown
            in USD.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total quantity surveys"
          value={numberFormatter.format(totalCount)}
          helperText={totalHelper}
        />
        <SummaryCard
          label="Accepted"
          value={numberFormatter.format(acceptedCount)}
          helperText={acceptedHelper}
        />
        <SummaryCard
          label="With invoice"
          value={numberFormatter.format(invoicedCount)}
          helperText={invoicedHelper}
        />
        <SummaryCard
          label="Aggregate billed"
          value={formatCurrency(aggregateTotal)}
          helperText={aggregateHelper}
        />
      </div>

      <div className="flex justify-end">
        <TableColumnVisibilityControl
          paramKey="qsColumns"
          columns={QUANTITY_SURVEY_COLUMN_OPTIONS}
          defaultVisible={DEFAULT_QUANTITY_SURVEY_COLUMN_IDS}
        />
      </div>

      <QuantitySurveysTable
        entries={sortedQuantitySurveys}
        filters={{
          status: statusOptions,
          purchaseOrder: purchaseOrderOptions,
          vendor: vendorOptions,
        }}
        visibleColumns={visibleColumns}
      />
    </div>
  );
}
