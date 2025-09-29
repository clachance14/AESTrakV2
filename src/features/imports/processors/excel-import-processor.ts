import 'server-only';

import { parseExcelFile, validateExcelSchema } from '@/libs/excel-parser';
import {
  EXPECTED_PO_COLUMNS,
  EXPECTED_QS_COLUMNS,
  validateBatchData,
} from '@/libs/import-validators';
import { getSupabaseServiceRoleClient } from '@/libs/supabase/server-client';

import { getExistingPOData, getExistingQSNumbers, updateImportJob } from '../queries';
import { processPORecord, buildQSTotalsMap, createPOInsertData } from './po-processor';
import { processQSRecord, createQSInsertData, batchArray } from './qs-processor';
import type {
  ProcessingResult,
  ImportMetadata,
  PurchaseOrderRecord,
  QuantitySurveyRecord,
} from '../form-state';

export interface ProcessExcelImportParams {
  poFileBuffer: Buffer;
  qsFileBuffer: Buffer;
  organizationId: string;
  importJobId: string;
  userId: string;
}

export async function processExcelImport(
  params: ProcessExcelImportParams,
): Promise<ProcessingResult> {
  const { poFileBuffer, qsFileBuffer, organizationId, importJobId } = params;

  const startTime = Date.now();

  try {
    // Step 1: Parse Excel files
    console.log('Parsing Excel files...');
    const poData = parseExcelFile(poFileBuffer);
    const qsData = parseExcelFile(qsFileBuffer);

    // Step 2: Validate schemas
    const poSchemaValidation = validateExcelSchema(poData.headers, EXPECTED_PO_COLUMNS);
    const qsSchemaValidation = validateExcelSchema(qsData.headers, EXPECTED_QS_COLUMNS);

    if (!poSchemaValidation.isValid) {
      throw new Error(
        `PO file schema errors: ${poSchemaValidation.errors.map((e) => e.message).join(', ')}`,
      );
    }

    if (!qsSchemaValidation.isValid) {
      throw new Error(
        `QS file schema errors: ${qsSchemaValidation.errors.map((e) => e.message).join(', ')}`,
      );
    }

    // Step 3: Get existing data from database
    console.log('Fetching existing data...');
    const [existingPOs, existingQSNumbers] = await Promise.all([
      getExistingPOData(organizationId),
      getExistingQSNumbers(organizationId),
    ]);

    const existingPOMap = new Map(existingPOs.map((po) => [po.purchaseOrderNo, po]));

    // Step 4: Validate data integrity
    console.log('Validating data...');
    const poValidation = validateBatchData(poData.rows, 'po');
    const qsValidation = validateBatchData(qsData.rows, 'qs');

    if (!poValidation.isValid || !qsValidation.isValid) {
      const allErrors = [...poValidation.errors, ...qsValidation.errors]
        .map((e) => `Row ${e.row}, Column ${e.column}: ${e.message}`)
        .slice(0, 10); // Limit to first 10 errors

      throw new Error(`Data validation errors: ${allErrors.join('; ')}`);
    }

    // Step 5: Build QS totals map
    console.log('Building QS totals...');
    const qsTotals = buildQSTotalsMap(qsData.rows);

    // Step 6: Process PO records with change detection
    console.log('Processing PO records...');
    const processedPOs: PurchaseOrderRecord[] = [];

    for (const poRecord of poData.rows) {
      const processed = processPORecord(poRecord, organizationId, qsTotals, existingPOMap);
      processedPOs.push(processed);
    }

    // Step 7: Create PO number to ID mapping for QS processing
    const purchaseOrderIds = new Map(processedPOs.map((po) => [po.purchaseOrderNo, po.id]));

    // Step 8: Process QS records with change detection
    console.log('Processing QS records...');
    const processedQS: QuantitySurveyRecord[] = [];

    for (const qsRecord of qsData.rows) {
      const processed = processQSRecord(
        qsRecord,
        organizationId,
        importJobId,
        purchaseOrderIds,
        existingQSNumbers,
      );
      processedQS.push(processed);
    }

    // Step 9: Execute database operations
    console.log('Executing database operations...');
    const supabase = getSupabaseServiceRoleClient();

    // First, upsert all purchase orders in a single transaction
    const poInsertData = createPOInsertData(processedPOs);

    const { error: poError } = await supabase.from('purchase_orders').upsert(poInsertData, {
      onConflict: 'organization_id,purchase_order_no',
      ignoreDuplicates: false,
    });

    if (poError) {
      throw new Error(`Failed to upsert purchase orders: ${poError.message}`);
    }

    // Then, batch upsert quantity surveys (10k per batch)
    const qsInsertData = createQSInsertData(processedQS);
    const qsBatches = batchArray(qsInsertData, 10000);

    console.log(`Processing ${qsBatches.length} QS batches...`);

    for (let i = 0; i < qsBatches.length; i++) {
      const batch = qsBatches[i];
      console.log(`Processing QS batch ${i + 1}/${qsBatches.length} (${batch.length} records)`);

      const { error: qsError } = await supabase.from('quantity_surveys').upsert(batch, {
        // Primary key is consistent across imports via deterministic IDs
        onConflict: 'id',
        ignoreDuplicates: false,
      });

      if (qsError) {
        throw new Error(`Failed to upsert QS batch ${i + 1}: ${qsError.message}`);
      }
    }

    // Step 10: Calculate metadata
    const posNew = processedPOs.filter((po) => po._importStatus === 'new');
    const posUpdated = processedPOs.filter((po) => po._importStatus === 'updated');
    const posUnchanged = processedPOs.filter((po) => po._importStatus === 'unchanged');
    const qsNew = processedQS.filter((qs) => qs._importStatus === 'new');
    const qsUnchanged = processedQS.filter((qs) => qs._importStatus === 'unchanged');

    const poChanges = [...posNew, ...posUpdated].map((po) => {
      const changeType: 'new' | 'updated' = po._importStatus === 'updated' ? 'updated' : 'new';
      const totalSpentDelta =
        po.previousTotalSpent !== undefined
          ? Math.round((po.totalSpent - po.previousTotalSpent) * 100) / 100
          : null;
      const utilizationDelta =
        po.previousUtilizationPercent !== undefined
          ? Math.round((po.utilizationPercent - po.previousUtilizationPercent) * 100) / 100
          : null;

      return {
        id: po.id,
        purchaseOrderNo: po.purchaseOrderNo,
        orderShortText: po.orderShortText || null,
        status: po.status,
        orderValue: po.orderValue,
        totalSpent: po.totalSpent,
        previousTotalSpent: po.previousTotalSpent ?? null,
        totalSpentDelta,
        utilizationPercent: po.utilizationPercent,
        previousUtilizationPercent: po.previousUtilizationPercent ?? null,
        utilizationDelta,
        remainingBudget: po.remainingBudget,
        changeType,
      };
    });

    const qsChanges = qsNew.map((qs) => ({
      id: qs.id,
      purchaseOrderNo: qs.purchaseOrderNo,
      qsNumber: qs.qsNumber,
      total: qs.total,
      createdDate: qs.createdDate,
      contractorContact: qs.contractorContact,
    }));

    const metadata: ImportMetadata = {
      posNew: posNew.length,
      posUpdated: posUpdated.length,
      posUnchanged: posUnchanged.length,
      qsNew: qsNew.length,
      qsUnchanged: qsUnchanged.length,
      newPoIds: posNew.map((po) => po.id),
      updatedPoIds: posUpdated.map((po) => po.id),
      newQsIds: qsNew.map((qs) => qs.id),
      processingTimeMs: Date.now() - startTime,
      poChanges,
      qsChanges,
    };

    // Step 11: Update import job with success
    await updateImportJob({
      jobId: importJobId,
      status: 'succeeded',
      rowCount: processedPOs.length + processedQS.length,
      errorCount: 0,
      metadata,
    });

    console.log('Import completed successfully:', metadata);

    return {
      success: true,
      metadata,
      errors: [],
      rowsProcessed: processedPOs.length + processedQS.length,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Import failed:', errorMessage);

    // Update import job with failure
    await updateImportJob({
      jobId: importJobId,
      status: 'failed',
      errorCount: 1,
      metadata: {
        posNew: 0,
        posUpdated: 0,
        posUnchanged: 0,
        qsNew: 0,
        qsUnchanged: 0,
        newPoIds: [],
        updatedPoIds: [],
        newQsIds: [],
        processingTimeMs: Date.now() - startTime,
        poChanges: [],
        qsChanges: [],
      },
    });

    return {
      success: false,
      metadata: {
        posNew: 0,
        posUpdated: 0,
        posUnchanged: 0,
        qsNew: 0,
        qsUnchanged: 0,
        newPoIds: [],
        updatedPoIds: [],
        newQsIds: [],
        processingTimeMs: Date.now() - startTime,
        poChanges: [],
        qsChanges: [],
      },
      errors: [errorMessage],
      rowsProcessed: 0,
    };
  }
}
