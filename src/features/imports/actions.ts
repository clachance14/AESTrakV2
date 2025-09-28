'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { getActiveOrganization } from '@/features/organizations/queries';

import type { ImportActionState } from './form-state';
import { processExcelImport } from './processors/excel-import-processor';
import { createImportJob } from './queries';

export async function uploadAndProcessImportAction(
  prevState: ImportActionState,
  formData: FormData,
): Promise<ImportActionState> {
  try {
    // Extract files from form data
    const poFile = formData.get('poFile') as File;
    const qsFile = formData.get('qsFile') as File;

    // Validate files are provided
    const fieldErrors: Record<string, string> = {};

    if (!poFile || poFile.size === 0) {
      fieldErrors.poFile = 'Purchase order file is required.';
    }

    if (!qsFile || qsFile.size === 0) {
      fieldErrors.qsFile = 'Quantity survey file is required.';
    }

    // Validate file types
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ];

    if (poFile && !allowedTypes.includes(poFile.type)) {
      fieldErrors.poFile = 'Purchase order file must be an Excel file (.xlsx or .xls).';
    }

    if (qsFile && !allowedTypes.includes(qsFile.type)) {
      fieldErrors.qsFile = 'Quantity survey file must be an Excel file (.xlsx or .xls).';
    }

    // Validate file sizes (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (poFile && poFile.size > maxSize) {
      fieldErrors.poFile = 'Purchase order file is too large. Maximum size is 50MB.';
    }

    if (qsFile && qsFile.size > maxSize) {
      fieldErrors.qsFile = 'Quantity survey file is too large. Maximum size is 50MB.';
    }

    if (Object.keys(fieldErrors).length > 0) {
      return {
        status: 'error',
        fieldErrors,
      };
    }

    // Get active organization context
    const activeContext = await getActiveOrganization();

    if (!activeContext) {
      return {
        status: 'error',
        message: 'You must belong to an organization to import data.',
      };
    }

    // Convert files to buffers
    const poFileBuffer = Buffer.from(await poFile.arrayBuffer());
    const qsFileBuffer = Buffer.from(await qsFile.arrayBuffer());

    // Create import job
    const fileName = `${poFile.name} + ${qsFile.name}`;
    const importJobId = await createImportJob({
      organizationId: activeContext.membership.organizationId,
      type: 'purchase_orders', // Both types in one job
      fileName,
      createdBy: activeContext.userId,
    });

    // Process the import
    const result = await processExcelImport({
      poFileBuffer,
      qsFileBuffer,
      organizationId: activeContext.membership.organizationId,
      importJobId,
      userId: activeContext.userId,
    });

    // Revalidate imports page
    revalidatePath('/imports');

    if (result.success) {
      return {
        status: 'success',
        message: `Import completed successfully. Processed ${result.rowsProcessed} records.`,
        jobId: importJobId,
      };
    } else {
      return {
        status: 'error',
        message: `Import failed: ${result.errors.join('; ')}`,
        jobId: importJobId,
      };
    }
  } catch (error) {
    console.error('Import action error:', error);

    return {
      status: 'error',
      message:
        error instanceof Error ? error.message : 'An unexpected error occurred during import.',
    };
  }
}

export async function redirectToImportJob(jobId: string) {
  redirect(`/imports/${jobId}`);
}
