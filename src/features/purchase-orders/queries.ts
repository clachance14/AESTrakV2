import { cache } from 'react';

import { createSupabaseServerClient } from '@/libs/supabase/server';

export type PurchaseOrderLogEntry = {
  id: string;
  purchaseOrderNo: string;
  status: string;
  orderValue: number;
  totalSpent: number;
  remainingBudget: number;
  utilizationPercent: number;
  vendorShortTerm: string | null;
  workCoordinatorName: string | null;
  startDate: string | null;
  completionDate: string | null;
  createdAt: string;
};

export const getPurchaseOrdersForOrganization = cache(
  async (organizationId: string): Promise<PurchaseOrderLogEntry[]> => {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(
        `id, purchase_order_no, status, order_value, total_spent, remaining_budget, utilization_percent, vendor_short_term, work_coordinator_name, start_date, completion_date, created_at`,
      )
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return [];
    }

    return data.map((po) => ({
      id: po.id,
      purchaseOrderNo: po.purchase_order_no,
      status: po.status,
      orderValue: po.order_value,
      totalSpent: po.total_spent,
      remainingBudget: po.remaining_budget,
      utilizationPercent: po.utilization_percent,
      vendorShortTerm: po.vendor_short_term,
      workCoordinatorName: po.work_coordinator_name,
      startDate: po.start_date,
      completionDate: po.completion_date,
      createdAt: po.created_at,
    }));
  },
);

export type UtilizationDistribution = {
  status: 'On Track' | 'Monitor' | 'Critical' | 'Over Auth';
  count: number;
};

type DateRangeParams = {
  startDate?: string | null;
  endDate?: string | null;
};

export const getPOUtilizationDistribution = cache(
  async (
    organizationId: string,
    { startDate, endDate }: DateRangeParams = {},
  ): Promise<UtilizationDistribution[]> => {
    const supabase = await createSupabaseServerClient();

    let rangeStart: Date | null = null;
    let rangeEndExclusive: Date | null = null;

    if (startDate) {
      const parsed = new Date(startDate);
      if (!Number.isNaN(parsed.getTime())) {
        rangeStart = parsed;
      }
    }

    if (endDate) {
      const parsed = new Date(endDate);
      if (!Number.isNaN(parsed.getTime())) {
        rangeEndExclusive = new Date(parsed);
        rangeEndExclusive.setDate(rangeEndExclusive.getDate() + 1);
      }
    }

    const query = supabase
      .from('purchase_orders')
      .select('utilization_percent')
      .eq('organization_id', organizationId);

    if (rangeStart) {
      query.gte('start_date', rangeStart.toISOString());
    }

    if (rangeEndExclusive) {
      query.lt('start_date', rangeEndExclusive.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return [];
    }

    const distribution = {
      'On Track': 0,
      Monitor: 0,
      Critical: 0,
      'Over Auth': 0,
    };

    data.forEach((po) => {
      const utilization = po.utilization_percent;
      if (utilization < 75) {
        distribution['On Track']++;
      } else if (utilization < 90) {
        distribution['Monitor']++;
      } else if (utilization < 100) {
        distribution['Critical']++;
      } else {
        distribution['Over Auth']++;
      }
    });

    return Object.entries(distribution).map(([status, count]) => ({
      status: status as UtilizationDistribution['status'],
      count,
    }));
  },
);

export type TopPO = {
  id: string;
  purchaseOrderNo: string;
  orderShortText: string | null;
  totalSpent: number;
  utilizationPercent: number;
};

export const getTopPOsBySpending = cache(
  async (
    organizationId: string,
    limit: number = 10,
    { startDate, endDate }: DateRangeParams = {},
  ): Promise<TopPO[]> => {
    const supabase = await createSupabaseServerClient();

    let rangeStart: Date | null = null;
    let rangeEndExclusive: Date | null = null;

    if (startDate) {
      const parsed = new Date(startDate);
      if (!Number.isNaN(parsed.getTime())) {
        rangeStart = parsed;
      }
    }

    if (endDate) {
      const parsed = new Date(endDate);
      if (!Number.isNaN(parsed.getTime())) {
        rangeEndExclusive = new Date(parsed);
        rangeEndExclusive.setDate(rangeEndExclusive.getDate() + 1);
      }
    }

    const query = supabase
      .from('purchase_orders')
      .select('id, purchase_order_no, order_short_text, total_spent, utilization_percent')
      .eq('organization_id', organizationId)
      .order('total_spent', { ascending: false })
      .limit(limit);

    if (rangeStart) {
      query.gte('start_date', rangeStart.toISOString());
    }

    if (rangeEndExclusive) {
      query.lt('start_date', rangeEndExclusive.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return [];
    }

    return data.map((po) => ({
      id: po.id,
      purchaseOrderNo: po.purchase_order_no,
      orderShortText: po.order_short_text,
      totalSpent: po.total_spent,
      utilizationPercent: po.utilization_percent,
    }));
  },
);

export type POFinancialSummary = {
  totalOrderValue: number;
  totalRemainingBudget: number;
};

export const getPOFinancialSummary = cache(
  async (
    organizationId: string,
    { startDate, endDate }: DateRangeParams = {},
  ): Promise<POFinancialSummary> => {
    const supabase = await createSupabaseServerClient();

    let rangeStart: Date | null = null;
    let rangeEndExclusive: Date | null = null;

    if (startDate) {
      const parsed = new Date(startDate);
      if (!Number.isNaN(parsed.getTime())) {
        rangeStart = parsed;
      }
    }

    if (endDate) {
      const parsed = new Date(endDate);
      if (!Number.isNaN(parsed.getTime())) {
        rangeEndExclusive = new Date(parsed);
        rangeEndExclusive.setDate(rangeEndExclusive.getDate() + 1);
      }
    }

    const query = supabase
      .from('purchase_orders')
      .select('order_value, remaining_budget')
      .eq('organization_id', organizationId);

    if (rangeStart) {
      query.gte('start_date', rangeStart.toISOString());
    }

    if (rangeEndExclusive) {
      query.lt('start_date', rangeEndExclusive.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return {
        totalOrderValue: 0,
        totalRemainingBudget: 0,
      };
    }

    const totalOrderValue = data.reduce((sum, po) => sum + po.order_value, 0);
    const totalRemainingBudget = data.reduce((sum, po) => sum + po.remaining_budget, 0);

    return {
      totalOrderValue,
      totalRemainingBudget,
    };
  },
);
