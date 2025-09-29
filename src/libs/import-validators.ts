import 'server-only';

import type { ValidationError, ValidationResult } from '@/features/imports/types';

import { formatExcelDate, formatExcelNumber, cleanExcelText } from './excel-parser';

export const EXPECTED_PO_COLUMNS = [
  'Purchase order No.',
  'Status',
  'Company',
  'Order short text',
  'Order value',
  'Vendor ID',
  'Short term',
  'Name',
  'Start date',
  'Date of completion',
];

export const EXPECTED_QS_COLUMNS = [
  'Purchase order No.',
  'Q.S. number',
  'Quantity survey short text',
  'Contractor contact',
  'Vendor ID',
  'TOTAL',
  'CREATED',
  'TRANSFERED',
  'Accepted',
  'Invoice number',
  'Invoice Document Date',
  'Accounting Document',
];

export function validatePORecord(
  record: Record<string, unknown>,
  rowIndex: number,
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Required fields
  const poNumber = cleanExcelText(record['Purchase order No.']);
  if (!poNumber) {
    errors.push({
      row: rowIndex,
      column: 'Purchase order No.',
      value: record['Purchase order No.'],
      message: 'Purchase order number is required',
    });
  }

  // Order value must be numeric
  const orderValue = record['Order value'];
  if (orderValue !== null && orderValue !== undefined && orderValue !== '') {
    const numericValue = formatExcelNumber(orderValue);
    if (isNaN(numericValue)) {
      errors.push({
        row: rowIndex,
        column: 'Order value',
        value: orderValue,
        message: 'Order value must be a valid number',
      });
    }
  }

  // Validate dates if present
  const startDate = record['Start date'];
  if (startDate && formatExcelDate(startDate) === null) {
    errors.push({
      row: rowIndex,
      column: 'Start date',
      value: startDate,
      message: 'Start date has invalid format',
    });
  }

  const completionDate = record['Date of completion'];
  if (completionDate && formatExcelDate(completionDate) === null) {
    errors.push({
      row: rowIndex,
      column: 'Date of completion',
      value: completionDate,
      message: 'Completion date has invalid format',
    });
  }

  return errors;
}

export function validateQSRecord(
  record: Record<string, unknown>,
  rowIndex: number,
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Required fields
  const poNumber = cleanExcelText(record['Purchase order No.']);
  if (!poNumber) {
    errors.push({
      row: rowIndex,
      column: 'Purchase order No.',
      value: record['Purchase order No.'],
      message: 'Purchase order number is required',
    });
  }

  const qsNumber = cleanExcelText(record['Q.S. number']);
  if (!qsNumber) {
    errors.push({
      row: rowIndex,
      column: 'Q.S. number',
      value: record['Q.S. number'],
      message: 'Q.S. number is required',
    });
  }

  // Total must be numeric
  const total = record['TOTAL'];
  if (total !== null && total !== undefined && total !== '') {
    const numericValue = formatExcelNumber(total);
    if (isNaN(numericValue)) {
      errors.push({
        row: rowIndex,
        column: 'TOTAL',
        value: total,
        message: 'Total must be a valid number',
      });
    }
  }

  // Validate dates if present
  const dateFields = [
    { field: 'CREATED', column: 'CREATED' },
    { field: 'TRANSFERED', column: 'TRANSFERED' },
    { field: 'Accepted', column: 'Accepted' },
    { field: 'Invoice Document Date', column: 'Invoice Document Date' },
  ];

  for (const { field, column } of dateFields) {
    const dateValue = record[field];
    if (dateValue && formatExcelDate(dateValue) === null) {
      errors.push({
        row: rowIndex,
        column,
        value: dateValue,
        message: `${column} has invalid date format`,
      });
    }
  }

  return errors;
}

export function validateBatchData(
  records: Record<string, unknown>[],
  type: 'po' | 'qs',
  startRowIndex: number = 0,
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  records.forEach((record, index) => {
    const rowIndex = startRowIndex + index + 1; // +1 for 1-based row numbers

    if (type === 'po') {
      errors.push(...validatePORecord(record, rowIndex));
    } else {
      errors.push(...validateQSRecord(record, rowIndex));
    }
  });

  // Check for duplicates within the batch
  if (type === 'po') {
    const poNumbers = new Set<string>();
    records.forEach((record, index) => {
      const poNumber = cleanExcelText(record['Purchase order No.']);
      if (poNumber) {
        if (poNumbers.has(poNumber)) {
          warnings.push({
            row: startRowIndex + index + 1,
            column: 'Purchase order No.',
            value: poNumber,
            message: `Duplicate purchase order number: ${poNumber}`,
          });
        } else {
          poNumbers.add(poNumber);
        }
      }
    });
  } else {
    const qsNumbers = new Set<string>();
    records.forEach((record, index) => {
      const qsNumber = cleanExcelText(record['Q.S. number']);
      if (qsNumber) {
        if (qsNumbers.has(qsNumber)) {
          warnings.push({
            row: startRowIndex + index + 1,
            column: 'Q.S. number',
            value: qsNumber,
            message: `Duplicate Q.S. number: ${qsNumber}`,
          });
        } else {
          qsNumbers.add(qsNumber);
        }
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function createValidationSummary(results: ValidationResult[]): {
  totalErrors: number;
  totalWarnings: number;
  isValid: boolean;
  errorsByColumn: Record<string, number>;
  warningsByColumn: Record<string, number>;
} {
  let totalErrors = 0;
  let totalWarnings = 0;
  const errorsByColumn: Record<string, number> = {};
  const warningsByColumn: Record<string, number> = {};

  for (const result of results) {
    totalErrors += result.errors.length;
    totalWarnings += result.warnings.length;

    for (const error of result.errors) {
      errorsByColumn[error.column] = (errorsByColumn[error.column] || 0) + 1;
    }

    for (const warning of result.warnings) {
      warningsByColumn[warning.column] = (warningsByColumn[warning.column] || 0) + 1;
    }
  }

  return {
    totalErrors,
    totalWarnings,
    isValid: totalErrors === 0,
    errorsByColumn,
    warningsByColumn,
  };
}
