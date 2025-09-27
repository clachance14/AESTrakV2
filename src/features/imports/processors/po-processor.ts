import { v5 as uuidv5 } from 'uuid';

import { formatExcelDate, formatExcelNumber, cleanExcelText } from '@/libs/excel-parser';

import type { PurchaseOrderRecord, ExistingPOData } from '../form-state';

const PO_NAMESPACE = uuidv5('aestrak/purchase-order', uuidv5.URL);

export function deterministic_uuid(namespace: string, name: string): string {
  return uuidv5(name, namespace);
}

export function processPORecord(
  record: Record<string, unknown>,
  organizationId: string,
  qsTotals: Map<string, number>,
  existingPOs: Map<string, ExistingPOData>,
): PurchaseOrderRecord {
  const poNumber = cleanExcelText(record['Purchase order No.']) || '';
  const poId = deterministic_uuid(PO_NAMESPACE, poNumber);

  const orderValue = formatExcelNumber(record['Order value']);
  const totalSpent = qsTotals.get(poNumber) || 0;
  const remainingBudget = Math.max(orderValue - totalSpent, 0);

  let utilizationPercent = 0;
  if (orderValue > 0) {
    utilizationPercent = Math.round((totalSpent / orderValue) * 100 * 100) / 100; // Round to 2 decimals
  }

  // Determine import status
  const existing = existingPOs.get(poNumber);
  let importStatus: 'new' | 'updated' | 'unchanged' = 'new';
  let previousTotalSpent: number | undefined;
  let previousUtilizationPercent: number | undefined;

  if (existing) {
    previousTotalSpent = existing.totalSpent;
    previousUtilizationPercent = existing.utilizationPercent;
    // Check if utilization changed (main indicator of change)
    if (Math.abs(existing.utilizationPercent - utilizationPercent) < 0.01) {
      importStatus = 'unchanged';
    } else {
      importStatus = 'updated';
    }
  }

  return {
    id: poId,
    organizationId,
    purchaseOrderNo: poNumber,
    status: cleanExcelText(record['Status']) || 'open',
    company: cleanExcelText(record['Company']),
    orderShortText: cleanExcelText(record['Order short text']),
    orderValue,
    totalSpent: Math.round(totalSpent * 100) / 100, // Round to 2 decimals
    remainingBudget: Math.round(remainingBudget * 100) / 100,
    utilizationPercent,
    vendorId: cleanExcelText(record['Vendor ID']),
    vendorShortTerm: cleanExcelText(record['Short term']),
    workCoordinatorName:
      cleanExcelText(record['Name']) || cleanExcelText(record['Work coordinator']),
    startDate: formatExcelDate(record['Start date']),
    completionDate: formatExcelDate(record['Date of completion']),
    _importStatus: importStatus,
    previousTotalSpent,
    previousUtilizationPercent,
  };
}

export function buildQSTotalsMap(qsRecords: Record<string, unknown>[]): Map<string, number> {
  const qsTotals = new Map<string, number>();

  for (const record of qsRecords) {
    const poNumber = cleanExcelText(record['Purchase order No.']);
    const total = formatExcelNumber(record['TOTAL']);

    if (poNumber) {
      const currentTotal = qsTotals.get(poNumber) || 0;
      qsTotals.set(poNumber, currentTotal + total);
    }
  }

  return qsTotals;
}

export function createPOInsertData(pos: PurchaseOrderRecord[]) {
  return pos.map((po) => ({
    id: po.id,
    organization_id: po.organizationId,
    purchase_order_no: po.purchaseOrderNo,
    status: po.status,
    company: po.company,
    order_short_text: po.orderShortText,
    order_value: po.orderValue,
    total_spent: po.totalSpent,
    remaining_budget: po.remainingBudget,
    utilization_percent: po.utilizationPercent,
    vendor_id: po.vendorId,
    vendor_short_term: po.vendorShortTerm,
    work_coordinator_name: po.workCoordinatorName,
    start_date: po.startDate,
    completion_date: po.completionDate,
  }));
}
