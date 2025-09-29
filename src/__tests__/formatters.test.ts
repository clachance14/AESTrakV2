import { describe, expect, it } from 'vitest';

import { formatCurrency, formatDate, formatNullableText, formatPercent } from '@/libs/formatters';

describe('formatters', () => {
  it('formats currency values with USD symbol', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('returns placeholder for empty currency values', () => {
    expect(formatCurrency(null)).toBe('—');
    expect(formatCurrency(undefined)).toBe('—');
  });

  it('formats percent values from whole numbers', () => {
    expect(formatPercent(75)).toBe('75%');
    expect(formatPercent(71.5)).toBe('71.5%');
  });

  it('returns placeholder for empty percent values', () => {
    expect(formatPercent(null)).toBe('—');
  });

  it('formats ISO dates when requested', () => {
    expect(formatDate('2025-01-15', { iso: true })).toBe('2025-01-15');
  });

  it('falls back to original value for invalid dates', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date');
  });

  it('normalizes nullable text entries', () => {
    expect(formatNullableText('')).toBe('—');
    expect(formatNullableText('   ')).toBe('—');
    expect(formatNullableText('Vendor')).toBe('Vendor');
  });
});
