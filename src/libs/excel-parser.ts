import 'server-only';
import * as XLSX from 'xlsx';

import type { ValidationResult } from '@/features/imports/types';

export interface ParsedExcelData {
  headers: string[];
  rows: Record<string, unknown>[];
  totalRows: number;
}

export function parseExcelFile(fileBuffer: Buffer, sheetIndex: number = 0): ParsedExcelData {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[sheetIndex];

  if (!sheetName) {
    throw new Error(`Sheet at index ${sheetIndex} not found`);
  }

  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];

  if (jsonData.length === 0) {
    throw new Error('Excel file is empty');
  }

  const headers = jsonData[0] as string[];
  const dataRows = jsonData.slice(1);

  const rows = dataRows
    .filter((row) => row.some((cell) => cell !== null && cell !== undefined && cell !== ''))
    .map((row) => {
      const record: Record<string, unknown> = {};
      headers.forEach((header, index) => {
        record[header] = row[index] ?? null;
      });
      return record;
    });

  return {
    headers,
    rows,
    totalRows: rows.length,
  };
}

export async function* streamExcelRows(
  fileBuffer: Buffer,
  sheetIndex: number = 0,
  batchSize: number = 1000,
): AsyncGenerator<Record<string, unknown>[]> {
  const parsed = parseExcelFile(fileBuffer, sheetIndex);

  for (let i = 0; i < parsed.rows.length; i += batchSize) {
    const batch = parsed.rows.slice(i, i + batchSize);
    yield batch;
  }
}

export function validateExcelSchema(
  headers: string[],
  expectedColumns: string[],
): ValidationResult {
  const errors: Array<{ row: number; column: string; value: unknown; message: string }> = [];
  const warnings: Array<{ row: number; column: string; value: unknown; message: string }> = [];

  const missingColumns = expectedColumns.filter((col) => !headers.includes(col));
  const extraColumns = headers.filter((col) => !expectedColumns.includes(col));

  for (const missing of missingColumns) {
    errors.push({
      row: 0,
      column: missing,
      value: null,
      message: `Required column '${missing}' is missing`,
    });
  }

  for (const extra of extraColumns) {
    warnings.push({
      row: 0,
      column: extra,
      value: null,
      message: `Unexpected column '${extra}' found`,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function formatExcelDate(excelDate: unknown): string | null {
  if (!excelDate) return null;

  // If it's already a string in ISO format, return as is
  if (typeof excelDate === 'string' && /^\d{4}-\d{2}-\d{2}/.test(excelDate)) {
    return excelDate.split('T')[0]; // Extract date part only
  }

  // If it's a number (Excel serial date)
  if (typeof excelDate === 'number') {
    const jsDate = XLSX.SSF.parse_date_code(excelDate);
    if (jsDate) {
      return `${jsDate.y}-${String(jsDate.m).padStart(2, '0')}-${String(jsDate.d).padStart(2, '0')}`;
    }
  }

  // If it's a Date object
  if (excelDate instanceof Date) {
    return excelDate.toISOString().split('T')[0];
  }

  // Try to parse as string
  if (typeof excelDate === 'string') {
    const parsed = new Date(excelDate);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
  }

  return null;
}

export function formatExcelNumber(excelValue: unknown): number {
  if (typeof excelValue === 'number') {
    return excelValue;
  }

  if (typeof excelValue === 'string') {
    const cleaned = excelValue.replace(/,/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

export function cleanExcelText(excelValue: unknown): string | null {
  if (!excelValue) return null;

  if (typeof excelValue === 'string') {
    return excelValue.trim();
  }

  if (typeof excelValue === 'number') {
    return String(excelValue);
  }

  return String(excelValue).trim();
}
