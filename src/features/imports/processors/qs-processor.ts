import { v5 as uuidv5 } from 'uuid';

import { formatExcelDate, formatExcelNumber, cleanExcelText } from '@/libs/excel-parser';

import type { QuantitySurveyRecord } from '../form-state';

const QS_NAMESPACE = uuidv5('aestrak/quantity-survey', uuidv5.URL);

export function deterministic_uuid(namespace: string, name: string): string {
  return uuidv5(name, namespace);
}

export function processQSRecord(
  record: Record<string, unknown>,
  organizationId: string,
  importJobId: string,
  purchaseOrderIds: Map<string, string>,
  existingQSNumbers: Set<string>,
): QuantitySurveyRecord {
  const poNumber = cleanExcelText(record['Purchase order No.']) || '';
  const qsNumber = cleanExcelText(record['Q.S. number']) || '';
  const qsId = deterministic_uuid(QS_NAMESPACE, `${poNumber}:${qsNumber}`);

  const purchaseOrderId = purchaseOrderIds.get(poNumber) || null;

  // Determine import status
  const importStatus: 'new' | 'unchanged' = existingQSNumbers.has(qsNumber) ? 'unchanged' : 'new';

  return {
    id: qsId,
    organizationId,
    purchaseOrderId,
    purchaseOrderNo: poNumber,
    qsNumber,
    quantitySurveyShortText: cleanExcelText(record['Quantity survey short text']),
    contractorContact:
      cleanExcelText(record['Contractor contact']) || cleanExcelText(record['Contractor Contact']),
    vendorId: cleanExcelText(record['Vendor ID']),
    total: formatExcelNumber(record['TOTAL']),
    createdDate: formatExcelDate(record['CREATED']),
    transferDate: formatExcelDate(record['TRANSFERED']),
    acceptedDate: formatExcelDate(record['Accepted']),
    invoiceNumber: cleanExcelText(record['Invoice number']),
    invoiceDate: formatExcelDate(record['Invoice Document Date']),
    accountingDocument: cleanExcelText(record['Accounting Document']),
    importJobId,
    _importStatus: importStatus,
  };
}

export function createQSInsertData(qsRecords: QuantitySurveyRecord[]) {
  return qsRecords.map((qs) => ({
    id: qs.id,
    organization_id: qs.organizationId,
    purchase_order_id: qs.purchaseOrderId,
    purchase_order_no: qs.purchaseOrderNo,
    qs_number: qs.qsNumber,
    quantity_survey_short_text: qs.quantitySurveyShortText,
    contractor_contact: qs.contractorContact,
    vendor_id: qs.vendorId,
    total: qs.total,
    created_date: qs.createdDate,
    transfer_date: qs.transferDate,
    accepted_date: qs.acceptedDate,
    invoice_number: qs.invoiceNumber,
    invoice_date: qs.invoiceDate,
    accounting_document: qs.accountingDocument,
    import_job_id: qs.importJobId,
  }));
}

export function batchArray<T>(array: T[], batchSize: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize));
  }
  return batches;
}
