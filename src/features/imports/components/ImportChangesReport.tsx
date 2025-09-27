import type { ImportJob, PurchaseOrderChange, QuantitySurveyChange } from '../form-state';

interface ImportChangesReportProps {
  job: ImportJob;
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 2,
});

function formatPercent(value: number | null) {
  if (value === null) {
    return 'N/A';
  }

  return percentFormatter.format(value / 100);
}

function formatCurrency(value: number | null) {
  if (value === null) {
    return 'N/A';
  }

  return currencyFormatter.format(value);
}

function formatDelta(value: number | null, options: { isPercent?: boolean } = {}) {
  if (value === null) {
    return 'N/A';
  }

  const formatted = options.isPercent
    ? percentFormatter.format(value / 100)
    : currencyFormatter.format(Math.abs(value));

  const prefix = value > 0 ? '+ ' : value < 0 ? '- ' : '';
  return `${prefix}${formatted}`;
}

function renderPoSection(title: string, changes: PurchaseOrderChange[]) {
  if (changes.length === 0) {
    return (
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">No records for this import.</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        <span className="text-xs text-muted-foreground">
          {changes.length.toLocaleString()} items
        </span>
      </div>
      <div className="max-h-96 overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <th className="px-4 py-2">PO Number</th>
              <th className="px-4 py-2">Utilization (New)</th>
              <th className="px-4 py-2">Utilization (Previous / Delta)</th>
              <th className="px-4 py-2">Total Spent (New)</th>
              <th className="px-4 py-2">Total Spent (Previous / Delta)</th>
              <th className="px-4 py-2">Remaining Budget</th>
              <th className="px-4 py-2">Order Value</th>
              <th className="px-4 py-2">Summary</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {changes.map((change) => (
              <tr key={change.id} className="text-sm text-foreground">
                <td className="px-4 py-2 font-medium">{change.purchaseOrderNo}</td>
                <td className="px-4 py-2">{formatPercent(change.utilizationPercent)}</td>
                <td className="px-4 py-2 text-muted-foreground">
                  <span className="block">{formatPercent(change.previousUtilizationPercent)}</span>
                  <span className="block text-xs">
                    {formatDelta(change.utilizationDelta, { isPercent: true })}
                  </span>
                </td>
                <td className="px-4 py-2">{formatCurrency(change.totalSpent)}</td>
                <td className="px-4 py-2 text-muted-foreground">
                  <span className="block">{formatCurrency(change.previousTotalSpent)}</span>
                  <span className="block text-xs">{formatDelta(change.totalSpentDelta)}</span>
                </td>
                <td className="px-4 py-2">{formatCurrency(change.remainingBudget)}</td>
                <td className="px-4 py-2">{formatCurrency(change.orderValue)}</td>
                <td className="px-4 py-2 text-muted-foreground">
                  {change.orderShortText || 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function renderQsSection(changes: QuantitySurveyChange[]) {
  if (changes.length === 0) {
    return (
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-foreground mb-2">New Quantity Surveys</h3>
        <p className="text-sm text-muted-foreground">No new quantity survey entries were added.</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">New Quantity Surveys</h3>
        <span className="text-xs text-muted-foreground">
          {changes.length.toLocaleString()} items
        </span>
      </div>
      <div className="max-h-72 overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <th className="px-4 py-2">QS Number</th>
              <th className="px-4 py-2">PO Number</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Created</th>
              <th className="px-4 py-2">Contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {changes.map((change) => (
              <tr key={change.id} className="text-sm text-foreground">
                <td className="px-4 py-2 font-medium">{change.qsNumber}</td>
                <td className="px-4 py-2">{change.purchaseOrderNo}</td>
                <td className="px-4 py-2">{formatCurrency(change.total)}</td>
                <td className="px-4 py-2 text-muted-foreground">{change.createdDate || 'N/A'}</td>
                <td className="px-4 py-2 text-muted-foreground">
                  {change.contractorContact || 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ImportChangesReport({ job }: ImportChangesReportProps) {
  const metadata = job.metadata;

  if (!metadata || job.status !== 'succeeded') {
    return null;
  }

  const poChanges = metadata.poChanges ?? [];
  const qsChanges = metadata.qsChanges ?? [];
  const hasLegacyCounts =
    poChanges.length === 0 &&
    qsChanges.length === 0 &&
    (metadata.posNew > 0 || metadata.posUpdated > 0 || metadata.qsNew > 0);

  const newPoChanges = poChanges.filter((change) => change.changeType === 'new');
  const updatedPoChanges = poChanges.filter((change) => change.changeType === 'updated');

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Change Report</h2>
        <p className="text-sm text-muted-foreground">
          Review the detailed delta captured during this import. Values show the latest data along
          with prior totals so you can verify what changed without leaving this page.
        </p>
      </div>
      {hasLegacyCounts && (
        <div className="border border-amber-200 bg-amber-50 text-amber-900 rounded-lg p-4">
          <h3 className="text-sm font-medium">Detailed breakdown unavailable</h3>
          <p className="text-sm mt-1">
            This import was processed before change tracking captured per-record deltas. The summary
            above reflects the totals, but row-level details are only available for imports run
            after this update. Re-run the import to view the full report.
          </p>
        </div>
      )}
      {renderPoSection('New Purchase Orders', newPoChanges)}
      {renderPoSection('Updated Purchase Orders', updatedPoChanges)}
      {renderQsSection(qsChanges)}
    </section>
  );
}
