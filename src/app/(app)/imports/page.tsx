import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { ImportHistoryTable } from '@/features/imports/components/ImportHistoryTable';
import { ImportUploadForm } from '@/features/imports/components/ImportUploadForm';
import { getImportJobsForOrganization } from '@/features/imports/queries';
import { getActiveOrganization } from '@/features/organizations/queries';

export const metadata: Metadata = {
  title: 'Import Data – AESTrak',
};

export default async function ImportsPage() {
  const activeContext = await getActiveOrganization();

  if (!activeContext) {
    redirect('/login');
  }

  const importJobs = await getImportJobsForOrganization(
    activeContext.membership.organizationId,
    10,
  );

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">Data / Import</div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Import Data</h1>
          <p className="text-sm text-muted-foreground">
            Upload Excel files to import purchase orders and quantity surveys for{' '}
            {activeContext.membership.organizationName}.
          </p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-medium text-foreground">
              Upload Purchase Orders & Quantity Surveys
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Both files are required for import. The system will calculate PO utilization from QS
              data.
            </p>
          </div>

          <ImportUploadForm />
        </div>
      </div>

      {/* Import Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Import Instructions</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Both PO and QS Excel files must be uploaded together</li>
          <li>• Files can be up to 50MB each (supports .xlsx and .xls formats)</li>
          <li>• Import detects new and updated records automatically</li>
          <li>• Processing may take several minutes for large files (200k+ rows)</li>
          <li>• You&apos;ll receive a summary of changes after import completes</li>
        </ul>
      </div>

      {/* Import History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-foreground">Recent Imports</h2>
          {importJobs.length > 0 && (
            <div className="text-sm text-gray-500">
              Showing last {importJobs.length} import{importJobs.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        <ImportHistoryTable jobs={importJobs} />
      </div>

      {/* Help Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-foreground mb-2">Need Help?</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Files should match the format exported from your ERP system</p>
          <p>• Contact support if you encounter validation errors or processing issues</p>
          <p>• Import jobs are tracked for audit purposes and can be reviewed anytime</p>
        </div>
      </div>
    </div>
  );
}
