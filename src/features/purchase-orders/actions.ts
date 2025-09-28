'use server';

import { getQuantitySurveysForPurchaseOrder } from '@/features/quantity-surveys/queries';

export async function fetchQuantitySurveysForPO(organizationId: string, poNumber: string) {
  return getQuantitySurveysForPurchaseOrder(organizationId, poNumber);
}
