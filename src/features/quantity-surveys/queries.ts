import { cache } from 'react';

import { createSupabaseServerClient } from '@/libs/supabase/server';

export type QuantitySurveyLogEntry = {
  id: string;
  qsNumber: string;
  purchaseOrderNo: string;
  description: string | null;
  total: number;
  vendorShortTerm: string | null;
  vendorId: string | null;
  contractorContact: string | null;
  createdDate: string | null;
  transferDate: string | null;
  acceptedDate: string | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  accountingDocument: string | null;
  createdAt: string;
};

const QUANTITY_SURVEY_LOG_LIMIT = 100;

export const getQuantitySurveysForOrganization = cache(
  async (organizationId: string): Promise<QuantitySurveyLogEntry[]> => {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('quantity_surveys')
      .select(
        `id, purchase_order_no, qs_number, quantity_survey_short_text, total, contractor_contact, vendor_id, created_date, transfer_date, accepted_date, invoice_number, invoice_date, accounting_document, created_at, purchase_orders(vendor_short_term)`,
      )
      .eq('organization_id', organizationId)
      .order('created_date', { ascending: false })
      .limit(QUANTITY_SURVEY_LOG_LIMIT);

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return [];
    }

    return data.map((qs) => ({
      id: qs.id,
      qsNumber: qs.qs_number,
      purchaseOrderNo: qs.purchase_order_no,
      description: qs.quantity_survey_short_text,
      total: qs.total,
      vendorShortTerm: qs.purchase_orders?.vendor_short_term ?? qs.vendor_id,
      vendorId: qs.vendor_id,
      contractorContact: qs.contractor_contact,
      createdDate: qs.created_date,
      transferDate: qs.transfer_date,
      acceptedDate: qs.accepted_date,
      invoiceNumber: qs.invoice_number,
      invoiceDate: qs.invoice_date,
      accountingDocument: qs.accounting_document,
      createdAt: qs.created_at,
    }));
  },
);

export type QuantitySurveyForPO = {
  id: string;
  qsNumber: string;
  total: number;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  status: string;
};

export const getQuantitySurveysForPurchaseOrder = cache(
  async (organizationId: string, poNumber: string): Promise<QuantitySurveyForPO[]> => {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('quantity_surveys')
      .select(
        'id, qs_number, total, invoice_number, invoice_date, accepted_date, transfer_date, created_date',
      )
      .eq('organization_id', organizationId)
      .eq('purchase_order_no', poNumber)
      .order('qs_number', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return [];
    }

    return data.map((qs) => ({
      id: qs.id,
      qsNumber: qs.qs_number,
      total: qs.total,
      invoiceNumber: qs.invoice_number,
      invoiceDate: qs.invoice_date,
      status: qs.accepted_date ? 'Accepted' : qs.transfer_date ? 'Transferred' : 'Created',
    }));
  },
);

export type BillingTrendData = {
  date: string;
  total: number;
};

type BillingTrendGrouping = 'daily' | 'weekly' | 'monthly';

type BillingTrendParams = {
  startDate?: string | null;
  endDate?: string | null;
  days?: number;
  grouping?: BillingTrendGrouping;
};

function getWeekStart(date: Date): Date {
  const weekStart = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const day = weekStart.getUTCDay();
  const diff = day === 0 ? 6 : day - 1; // ISO week starts Monday
  weekStart.setUTCDate(weekStart.getUTCDate() - diff);
  return weekStart;
}

function getMonthStart(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

export const getBillingTrendForOrganization = cache(
  async (
    organizationId: string,
    { startDate, endDate, days = 30, grouping = 'daily' }: BillingTrendParams = {},
  ): Promise<BillingTrendData[]> => {
    const supabase = await createSupabaseServerClient();

    let rangeStart: Date | null = null;
    let rangeEndExclusive: Date | null = null;

    if (startDate) {
      // Parse as UTC midnight to avoid timezone shifts for date-only strings
      const parts = startDate.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
        const day = parseInt(parts[2], 10);

        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          rangeStart = new Date(Date.UTC(year, month, day));
        }
      } else {
        // Fallback to original parsing if not in expected format
        const parsed = new Date(startDate);
        if (!Number.isNaN(parsed.getTime())) {
          rangeStart = parsed;
        }
      }
    }

    if (endDate) {
      // Parse as UTC midnight to avoid timezone shifts for date-only strings
      const parts = endDate.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
        const day = parseInt(parts[2], 10);

        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          rangeEndExclusive = new Date(Date.UTC(year, month, day));
          rangeEndExclusive.setDate(rangeEndExclusive.getDate() + 1);
        }
      } else {
        // Fallback to original parsing if not in expected format
        const parsed = new Date(endDate);
        if (!Number.isNaN(parsed.getTime())) {
          rangeEndExclusive = new Date(parsed);
          rangeEndExclusive.setDate(rangeEndExclusive.getDate() + 1);
        }
      }
    }

    if (!rangeStart && !rangeEndExclusive) {
      rangeStart = new Date();
      rangeStart.setDate(rangeStart.getDate() - days);
      rangeEndExclusive = new Date();
      rangeEndExclusive.setDate(rangeEndExclusive.getDate() + 1);
    }

    // If we only have one end of the range, calculate the other based on days parameter
    if (rangeStart && !rangeEndExclusive) {
      rangeEndExclusive = new Date(rangeStart);
      rangeEndExclusive.setDate(rangeEndExclusive.getDate() + days + 1);
    } else if (!rangeStart && rangeEndExclusive) {
      rangeStart = new Date(rangeEndExclusive);
      rangeStart.setDate(rangeStart.getDate() - days - 1);
    }

    const query = supabase
      .from('quantity_surveys')
      .select('accepted_date, total')
      .eq('organization_id', organizationId)
      .not('accepted_date', 'is', null)
      .order('accepted_date', { ascending: true });

    if (rangeStart) {
      query.gte('accepted_date', rangeStart.toISOString());
    }

    if (rangeEndExclusive) {
      query.lt('accepted_date', rangeEndExclusive.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return [];
    }

    // Group by date and sum totals
    const groupedData = data.reduce(
      (acc, qs) => {
        const rawDate = qs.accepted_date;
        if (!rawDate) {
          return acc;
        }

        const dateObj = new Date(rawDate);
        if (Number.isNaN(dateObj.getTime())) {
          return acc;
        }

        let bucket: string;

        if (grouping === 'weekly') {
          bucket = getWeekStart(dateObj).toISOString().split('T')[0];
        } else if (grouping === 'monthly') {
          bucket = getMonthStart(dateObj).toISOString().split('T')[0];
        } else {
          bucket = rawDate.split('T')[0];
        }

        if (!acc[bucket]) {
          acc[bucket] = 0;
        }
        acc[bucket] += qs.total;

        return acc;
      },
      {} as Record<string, number>,
    );

    // Fill in missing dates with zero values to ensure complete date range
    if (rangeStart && rangeEndExclusive) {
      const completeData: Record<string, number> = {};
      const currentDate = new Date(rangeStart);
      const endDate = new Date(rangeEndExclusive);
      endDate.setDate(endDate.getDate() - 1); // Convert back to inclusive end date

      while (currentDate <= endDate) {
        let bucket: string;

        if (grouping === 'weekly') {
          bucket = getWeekStart(currentDate).toISOString().split('T')[0];
        } else if (grouping === 'monthly') {
          bucket = getMonthStart(currentDate).toISOString().split('T')[0];
        } else {
          bucket = currentDate.toISOString().split('T')[0];
        }

        if (!completeData[bucket]) {
          completeData[bucket] = groupedData[bucket] || 0;
        }

        // Advance to next period
        if (grouping === 'weekly') {
          currentDate.setDate(currentDate.getDate() + 7);
        } else if (grouping === 'monthly') {
          currentDate.setMonth(currentDate.getMonth() + 1);
        } else {
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }

      const result = Object.entries(completeData)
        .map(([date, total]) => ({
          date,
          total,
        }))
        .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

      return result;
    }

    // Fallback to original behavior if range dates are not available
    const result = Object.entries(groupedData)
      .map(([date, total]) => ({
        date,
        total,
      }))
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

    return result;
  },
);
