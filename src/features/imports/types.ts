export interface ExcelColumnMapping {
  // Purchase Order columns
  purchaseOrderNo: string;
  status: string;
  company: string;
  orderShortText: string;
  orderValue: string;
  vendorId: string;
  vendorShortTerm: string;
  workCoordinatorName: string;
  startDate: string;
  completionDate: string;
}

export interface QSColumnMapping {
  // Quantity Survey columns
  purchaseOrderNo: string;
  qsNumber: string;
  quantitySurveyShortText: string;
  contractorContact: string;
  vendorId: string;
  total: string;
  createdDate: string;
  transferDate: string;
  acceptedDate: string;
  invoiceNumber: string;
  invoiceDate: string;
  accountingDocument: string;
}

export interface ValidationError {
  row: number;
  column: string;
  value: unknown;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface ExistingPOData {
  purchaseOrderNo: string;
  totalSpent: number;
  utilizationPercent: number;
  id: string;
}

export interface FileUploadInfo {
  name: string;
  size: number;
  type: string;
  buffer: Buffer;
}

export interface ImportProgress {
  stage: 'parsing' | 'validating' | 'processing' | 'completing';
  current: number;
  total: number;
  message: string;
}
