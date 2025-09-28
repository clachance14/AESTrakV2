import { createSupabaseServerClient } from '@/libs/supabase/server';

import type { ImportJob, ExistingPOData, ImportMetadata } from './form-state';

export async function getImportJobById(jobId: string): Promise<ImportJob | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.from('import_jobs').select('*').eq('id', jobId).single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    organizationId: data.organization_id,
    type: data.type,
    status: data.status,
    fileName: data.file_name,
    rowCount: data.row_count,
    errorCount: data.error_count,
    metadata: data.metadata as ImportMetadata | null,
    errorReportPath: data.error_report_path,
    createdBy: data.created_by,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function getImportJobsForOrganization(
  organizationId: string,
  limit: number = 10,
): Promise<ImportJob[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('import_jobs')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data.map((item) => ({
    id: item.id,
    organizationId: item.organization_id,
    type: item.type,
    status: item.status,
    fileName: item.file_name,
    rowCount: item.row_count,
    errorCount: item.error_count,
    metadata: item.metadata as ImportMetadata | null,
    errorReportPath: item.error_report_path,
    createdBy: item.created_by,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }));
}

export async function getExistingPOData(organizationId: string): Promise<ExistingPOData[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('purchase_orders')
    .select('id, purchase_order_no, total_spent, utilization_percent')
    .eq('organization_id', organizationId);

  if (error || !data) {
    return [];
  }

  return data.map((item) => ({
    purchaseOrderNo: item.purchase_order_no,
    totalSpent: item.total_spent,
    utilizationPercent: item.utilization_percent,
    id: item.id,
  }));
}

export async function getExistingQSNumbers(organizationId: string): Promise<Set<string>> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('quantity_surveys')
    .select('qs_number')
    .eq('organization_id', organizationId);

  if (error || !data) {
    return new Set();
  }

  return new Set(data.map((item) => item.qs_number));
}

export async function createImportJob(params: {
  organizationId: string;
  type: 'purchase_orders' | 'quantity_surveys';
  fileName: string;
  createdBy: string;
}): Promise<string> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('import_jobs')
    .insert({
      organization_id: params.organizationId,
      type: params.type,
      status: 'processing',
      file_name: params.fileName,
      created_by: params.createdBy,
    })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error(`Failed to create import job: ${error?.message || 'Unknown error'}`);
  }

  return data.id;
}

export async function updateImportJob(params: {
  jobId: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  rowCount?: number;
  errorCount?: number;
  metadata?: ImportMetadata;
  errorReportPath?: string;
}): Promise<void> {
  const supabase = await createSupabaseServerClient();

  const updateData: Record<string, unknown> = {
    status: params.status,
    updated_at: new Date().toISOString(),
  };

  if (params.rowCount !== undefined) {
    updateData.row_count = params.rowCount;
  }

  if (params.errorCount !== undefined) {
    updateData.error_count = params.errorCount;
  }

  if (params.metadata !== undefined) {
    updateData.metadata = params.metadata;
  }

  if (params.errorReportPath !== undefined) {
    updateData.error_report_path = params.errorReportPath;
  }

  const { error } = await supabase.from('import_jobs').update(updateData).eq('id', params.jobId);

  if (error) {
    throw new Error(`Failed to update import job: ${error.message}`);
  }
}

export async function getNewRecordsByImportJob(jobId: string): Promise<{
  newPOs: unknown[];
  newQS: unknown[];
  updatedPOs: unknown[];
}> {
  // Get the import job to find metadata
  const job = await getImportJobById(jobId);
  if (!job || !job.metadata) {
    return { newPOs: [], newQS: [], updatedPOs: [] };
  }

  const metadata = job.metadata;
  const supabase = await createSupabaseServerClient();

  // Get new POs
  const newPOs =
    metadata.newPoIds.length > 0
      ? await supabase.from('purchase_orders').select('*').in('id', metadata.newPoIds)
      : { data: [], error: null };

  // Get updated POs
  const updatedPOs =
    metadata.updatedPoIds.length > 0
      ? await supabase.from('purchase_orders').select('*').in('id', metadata.updatedPoIds)
      : { data: [], error: null };

  // Get new QS
  const newQS =
    metadata.newQsIds.length > 0
      ? await supabase.from('quantity_surveys').select('*').in('id', metadata.newQsIds)
      : { data: [], error: null };

  return {
    newPOs: newPOs.data || [],
    newQS: newQS.data || [],
    updatedPOs: updatedPOs.data || [],
  };
}
