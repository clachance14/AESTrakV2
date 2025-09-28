'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import { fetchQuantitySurveysForPO } from '@/features/purchase-orders/actions';
import type { PurchaseOrderColumnId } from '@/features/purchase-orders/columns';
import type { PurchaseOrderLogEntry } from '@/features/purchase-orders/queries';
import type { QuantitySurveyForPO } from '@/features/quantity-surveys/queries';
import { formatCurrency, formatDate } from '@/libs/formatters';

type PurchaseOrderExpandableRowProps = {
  purchaseOrder: PurchaseOrderLogEntry;
  organizationId: string;
  columnsToRender: Array<{ id: PurchaseOrderColumnId; align?: 'left' | 'right' }>;
  columnRenderers: Record<PurchaseOrderColumnId, (entry: PurchaseOrderLogEntry) => ReactNode>;
  cellClassNames: Partial<Record<PurchaseOrderColumnId, string>>;
};

function QuantitySurveyRow({ qs }: { qs: QuantitySurveyForPO }) {
  return (
    <tr className="border-t border-slate-200 bg-slate-50">
      <td className="px-8 py-2 text-xs text-slate-600">
        <span className="font-medium">{qs.qsNumber}</span>
      </td>
      <td className="px-4 py-2 text-xs text-slate-600">
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
          {qs.status}
        </span>
      </td>
      <td className="px-4 py-2 text-right text-xs text-slate-600 tabular-nums">
        {formatCurrency(qs.total)}
      </td>
      <td className="px-4 py-2 text-xs text-slate-600">{qs.invoiceNumber || '—'}</td>
      <td className="px-4 py-2 text-xs text-slate-600">
        {formatDate(qs.invoiceDate, { iso: true })}
      </td>
      <td className="px-4 py-2"></td>
      <td className="px-4 py-2"></td>
      <td className="px-4 py-2"></td>
      <td className="px-4 py-2"></td>
      <td className="px-4 py-2"></td>
    </tr>
  );
}

export function PurchaseOrderExpandableRow({
  purchaseOrder,
  organizationId,
  columnsToRender,
  columnRenderers,
  cellClassNames,
}: PurchaseOrderExpandableRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [quantitySurveys, setQuantitySurveys] = useState<QuantitySurveyForPO[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isExpanded && quantitySurveys.length === 0) {
      setIsLoading(true);
      fetchQuantitySurveysForPO(organizationId, purchaseOrder.purchaseOrderNo)
        .then(setQuantitySurveys)
        .catch((error) => {
          console.error('Failed to fetch quantity surveys:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isExpanded, organizationId, purchaseOrder.purchaseOrderNo, quantitySurveys.length]);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <tr className="transition hover:bg-muted">
        {columnsToRender.map((column, index) => (
          <td
            key={column.id}
            className={`px-4 py-3 ${
              column.align === 'right'
                ? `text-right ${cellClassNames[column.id] ?? ''}`
                : (cellClassNames[column.id] ?? '')
            }`}
          >
            {index === 0 ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleToggle}
                  className="flex-shrink-0 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label={isExpanded ? 'Collapse' : 'Expand'}
                >
                  <span className="text-xs">{isExpanded ? '▼' : '▶'}</span>
                </button>
                <div>{columnRenderers[column.id](purchaseOrder)}</div>
              </div>
            ) : (
              columnRenderers[column.id](purchaseOrder)
            )}
          </td>
        ))}
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={columnsToRender.length} className="px-0 py-0">
            <div className="bg-slate-25 border-t border-slate-200">
              {isLoading ? (
                <div className="px-8 py-4 text-center text-xs text-slate-500">
                  Loading quantity surveys...
                </div>
              ) : quantitySurveys.length === 0 ? (
                <div className="px-8 py-4 text-center text-xs text-slate-500">
                  No quantity surveys found for this purchase order.
                </div>
              ) : (
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100">
                      <th className="px-8 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-600">
                        QS Number
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-600">
                        Status
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wide text-slate-600">
                        Total
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-600">
                        Invoice #
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-600">
                        Invoice Date
                      </th>
                      <th className="px-4 py-2"></th>
                      <th className="px-4 py-2"></th>
                      <th className="px-4 py-2"></th>
                      <th className="px-4 py-2"></th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {quantitySurveys.map((qs) => (
                      <QuantitySurveyRow key={qs.id} qs={qs} />
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
