export interface BaseImportActionState {
  status: 'error' | 'success' | 'idle';
  message?: string;
  fieldErrors?: Record<string, string>;
}

export interface ImportActionState extends BaseImportActionState {
  jobId?: string;
}

export interface PurchaseOrderChange {
  id: string;
  purchaseOrderNo: string;
  orderShortText: string | null;
  status: string;
  orderValue: number;
  totalSpent: number;
  previousTotalSpent: number | null;
  totalSpentDelta: number | null;
  utilizationPercent: number;
  previousUtilizationPercent: number | null;
  utilizationDelta: number | null;
  remainingBudget: number;
  changeType: 'new' | 'updated';
}

export interface QuantitySurveyChange {
  id: string;
  purchaseOrderNo: string;
  qsNumber: string;
  total: number;
  createdDate: string | null;
  contractorContact: string | null;
}

export interface ImportMetadata {
  posNew: number;
  posUpdated: number;
  posUnchanged: number;
  qsNew: number;
  qsUnchanged: number;
  newPoIds: string[];
  updatedPoIds: string[];
  newQsIds: string[];
  processingTimeMs: number;
  poChanges: PurchaseOrderChange[];
  qsChanges: QuantitySurveyChange[];
}

export interface ImportJob {
  id: string;
  organizationId: string;
  type: 'purchase_orders' | 'quantity_surveys';
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  fileName: string | null;
  rowCount: number | null;
  errorCount: number | null;
  metadata: ImportMetadata | null;
  errorReportPath: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExistingPOData {
  purchaseOrderNo: string;
  totalSpent: number;
  utilizationPercent: number;
  id: string;
}

export interface ProcessingResult {
  success: boolean;
  metadata: ImportMetadata;
  errors: string[];
  rowsProcessed: number;
}

export interface PurchaseOrderRecord {
  id: string;
  organizationId: string;
  purchaseOrderNo: string;
  status: string;
  company: string | null;
  orderShortText: string | null;
  orderValue: number;
  totalSpent: number;
  remainingBudget: number;
  utilizationPercent: number;
  vendorId: string | null;
  vendorShortTerm: string | null;
  workCoordinatorName: string | null;
  startDate: string | null;
  completionDate: string | null;
  _importStatus?: 'new' | 'updated' | 'unchanged';
  previousTotalSpent?: number;
  previousUtilizationPercent?: number;
}

export interface QuantitySurveyRecord {
  id: string;
  organizationId: string;
  purchaseOrderId: string | null;
  purchaseOrderNo: string;
  qsNumber: string;
  quantitySurveyShortText: string | null;
  contractorContact: string | null;
  vendorId: string | null;
  total: number;
  createdDate: string | null;
  transferDate: string | null;
  acceptedDate: string | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  accountingDocument: string | null;
  importJobId: string;
  _importStatus?: 'new' | 'unchanged';
}
