import { redirect } from 'next/navigation';

import { BillingTrendChart } from '@/components/ui/billing-trend-chart';
import { TopPOsChart } from '@/components/ui/top-pos-chart';
import { UtilizationDistributionChart } from '@/components/ui/utilization-distribution-chart';
import { BillingIntervalToggle } from '@/features/dashboard/components/billing-interval-toggle';
import { getActiveOrganization } from '@/features/organizations/queries';
import { PurchaseOrderDateFilters } from '@/features/purchase-orders/components/purchase-order-date-filters';
import {
  getPOUtilizationDistribution,
  getTopPOsBySpending,
  getPOFinancialSummary,
} from '@/features/purchase-orders/queries';
import { getBillingTrendForOrganization } from '@/features/quantity-surveys/queries';
import { formatDate } from '@/libs/formatters';

export const runtime = 'nodejs';

type DashboardSearchParams =
  | Record<string, string | string[] | undefined>
  | Promise<Record<string, string | string[] | undefined>>
  | undefined;

function getSingleParamValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function parseDate(value: string | undefined): Date | null {
  if (!value) {
    return null;
  }

  // Parse as UTC midnight to avoid timezone shifts for date-only strings
  // Date strings from form inputs are in YYYY-MM-DD format
  const parts = value.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const day = parseInt(parts[2], 10);

    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return new Date(Date.UTC(year, month, day));
    }
  }

  // Fallback to original parsing if not in expected format
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: DashboardSearchParams;
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const rawStartParam = getSingleParamValue(resolvedSearchParams.dashStartDateFrom);
  const rawEndParam = getSingleParamValue(resolvedSearchParams.dashStartDateTo);

  // Set defaults to YTD if no date parameters are provided
  let defaultStartParam = rawStartParam;
  let defaultEndParam = rawEndParam;

  if (!rawStartParam && !rawEndParam) {
    const today = new Date();
    const yearStart = new Date(today.getFullYear(), 0, 1);
    defaultStartParam = yearStart.toISOString().split('T')[0];
    defaultEndParam = today.toISOString().split('T')[0];
  }

  const startDateFrom = parseDate(defaultStartParam);
  const startDateTo = parseDate(defaultEndParam);
  const rawIntervalParam = getSingleParamValue(resolvedSearchParams.dashBillingInterval);
  const interval =
    rawIntervalParam === 'daily' || rawIntervalParam === 'monthly' ? rawIntervalParam : 'weekly';

  const activeContext = await getActiveOrganization();

  if (!activeContext) {
    redirect('/login');
  }

  const organizationId = activeContext.membership.organizationId;

  // Fetch chart data in parallel
  const [billingTrendData, utilizationData, topPOsData, financialSummary] = await Promise.all([
    getBillingTrendForOrganization(organizationId, {
      startDate: defaultStartParam ?? undefined,
      endDate: defaultEndParam ?? undefined,
      days: 30,
      grouping: interval,
    }),
    getPOUtilizationDistribution(organizationId, {
      startDate: defaultStartParam ?? undefined,
      endDate: defaultEndParam ?? undefined,
    }),
    getTopPOsBySpending(organizationId, 10, {
      startDate: defaultStartParam ?? undefined,
      endDate: defaultEndParam ?? undefined,
    }),
    getPOFinancialSummary(organizationId, {
      startDate: defaultStartParam ?? undefined,
      endDate: defaultEndParam ?? undefined,
    }),
  ]);

  const totalPurchaseOrders = utilizationData.reduce((sum, item) => sum + item.count, 0);
  const highUtilizationCount = utilizationData
    .filter((item) => item.status === 'Critical' || item.status === 'Over Auth')
    .reduce((sum, item) => sum + item.count, 0);
  const billingTotal = billingTrendData.reduce((sum, item) => sum + item.total, 0);
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const defaultRangeDays = 30;
  const rangeDurationDays =
    startDateFrom && startDateTo
      ? Math.max(
          Math.round((startDateTo.getTime() - startDateFrom.getTime()) / millisecondsPerDay) + 1,
          1,
        )
      : defaultRangeDays;
  const averageDailyBilling = billingTrendData.length ? billingTotal / rangeDurationDays : 0;
  const topPO = topPOsData[0] ?? null;

  const numberFormatter = new Intl.NumberFormat('en-US');
  const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

  const hasExplicitDateRange = Boolean(startDateFrom && startDateTo);
  const rangeLabel = hasExplicitDateRange
    ? `${formatDate(defaultStartParam!)} – ${formatDate(defaultEndParam!)}`
    : 'Last 30 days';
  const billingMetricLabel = hasExplicitDateRange
    ? 'Billing (selected range)'
    : 'Billing (last 30 days)';
  const billingMetricHelper = hasExplicitDateRange
    ? rangeLabel
    : 'Accepted QS total for trailing 30 days';
  const avgMetricHelper = hasExplicitDateRange
    ? `${rangeDurationDays} day range`
    : 'Average accepted QS per day (30 days)';

  const metrics = [
    {
      id: 'total-pos',
      label: 'Total purchase orders',
      value: numberFormatter.format(totalPurchaseOrders),
      helper: 'Active records tracked in AESTrak',
      variant: 'primary' as const,
    },
    {
      id: 'total-po-value',
      label: 'Total PO value',
      value: currencyFormatter.format(financialSummary.totalOrderValue),
      helper: hasExplicitDateRange ? rangeLabel : 'All active purchase orders',
      variant: 'primary' as const,
    },
    {
      id: 'total-remaining-budget',
      label: 'Total remaining to invoice',
      value: currencyFormatter.format(financialSummary.totalRemainingBudget),
      helper: hasExplicitDateRange ? rangeLabel : 'Remaining budget across all POs',
      variant: 'warning' as const,
    },
    {
      id: 'high-risk-pos',
      label: 'POs ≥ 90% utilized',
      value: numberFormatter.format(highUtilizationCount),
      helper: `${totalPurchaseOrders ? Math.round((highUtilizationCount / totalPurchaseOrders) * 100) : 0}% of portfolio`,
      variant: highUtilizationCount > 0 ? ('danger' as const) : ('success' as const),
    },
    {
      id: 'billing-30',
      label: billingMetricLabel,
      value: currencyFormatter.format(billingTotal),
      helper: billingMetricHelper,
      variant: 'success' as const,
    },
    {
      id: 'top-po',
      label: 'Top PO spending',
      value: topPO ? currencyFormatter.format(topPO.totalSpent) : '—',
      helper: topPO
        ? `#${topPO.purchaseOrderNo} – ${topPO.utilizationPercent.toFixed(1)}% utilized`
        : 'No PO data available',
      variant: 'warning' as const,
    },
    {
      id: 'avg-daily-billing',
      label: 'Avg. daily billing',
      value: currencyFormatter.format(averageDailyBilling),
      helper: avgMetricHelper,
      variant: 'primary' as const,
    },
  ];

  const variantColors: Record<(typeof metrics)[number]['variant'], string> = {
    primary: 'bg-blue-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview for {activeContext.membership.organizationName}
        </p>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <PurchaseOrderDateFilters fromParam="dashStartDateFrom" toParam="dashStartDateTo" />
        <BillingIntervalToggle paramKey="dashBillingInterval" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className="relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm"
          >
            <span
              className={`absolute inset-x-0 top-0 h-1 ${variantColors[metric.variant]} opacity-80`}
              aria-hidden="true"
            />
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {metric.label}
            </p>
            <div className="mt-3 text-3xl font-semibold text-foreground">{metric.value}</div>
            <p className="mt-2 text-sm text-muted-foreground">{metric.helper}</p>
          </div>
        ))}
      </div>

      {/* Option A: Billing Trend + Utilization Distribution */}
      <div className="space-y-6">
        <h2 className="text-lg font-medium">Option A: Trend Analysis</h2>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Billing Trend Chart */}
          <div className="rounded-lg border bg-white p-6">
            <div className="mb-4">
              <h3 className="text-base font-semibold">Billing Trend</h3>
              <p className="text-sm text-muted-foreground">
                {interval === 'daily'
                  ? `Daily billing for ${rangeLabel}`
                  : `${interval === 'weekly' ? 'Weekly' : 'Monthly'} billing for ${rangeLabel}`}
              </p>
            </div>
            <BillingTrendChart data={billingTrendData} interval={interval} />
          </div>

          {/* PO Utilization Distribution */}
          <div className="rounded-lg border bg-white p-6">
            <div className="mb-4">
              <h3 className="text-base font-semibold">PO Risk Distribution</h3>
              <p className="text-sm text-muted-foreground">Purchase orders by utilization status</p>
            </div>
            <UtilizationDistributionChart data={utilizationData} />
          </div>
        </div>
      </div>

      {/* Option B: Utilization Distribution + Top POs */}
      <div className="space-y-6">
        <h2 className="text-lg font-medium">Option B: Risk Focus</h2>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* PO Utilization Distribution (repeated) */}
          <div className="rounded-lg border bg-white p-6">
            <div className="mb-4">
              <h3 className="text-base font-semibold">PO Risk Distribution</h3>
              <p className="text-sm text-muted-foreground">Purchase orders by utilization status</p>
            </div>
            <UtilizationDistributionChart data={utilizationData} />
          </div>

          {/* Top 10 POs by Spending */}
          <div className="rounded-lg border bg-white p-6">
            <div className="mb-4">
              <h3 className="text-base font-semibold">Top 10 POs by Spending</h3>
              <p className="text-sm text-muted-foreground">Highest spending purchase orders</p>
            </div>
            <TopPOsChart data={topPOsData} />
          </div>
        </div>
      </div>
    </div>
  );
}
