import type { QuantitySurveyLogEntry } from '@/features/quantity-surveys/queries';

export type QuantitySurveyStatus = 'Accepted' | 'Invoiced' | 'Transferred' | 'Pending';

export function getQuantitySurveyStatus(entry: QuantitySurveyLogEntry): QuantitySurveyStatus {
  if (entry.acceptedDate) {
    return 'Accepted';
  }

  if (entry.invoiceNumber || entry.invoiceDate) {
    return 'Invoiced';
  }

  if (entry.transferDate) {
    return 'Transferred';
  }

  return 'Pending';
}
