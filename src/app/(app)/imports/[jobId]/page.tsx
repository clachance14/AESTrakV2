import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';

import { ImportChangesReport } from '@/features/imports/components/ImportChangesReport';
import { ImportJobStatus } from '@/features/imports/components/ImportJobStatus';
import { getImportJobById } from '@/features/imports/queries';
import { getActiveOrganization } from '@/features/organizations/queries';

interface ImportJobDetailPageProps {
  params: Promise<{ jobId: string }>;
}

export async function generateMetadata({ params }: ImportJobDetailPageProps): Promise<Metadata> {
  const { jobId } = await params;

  return {
    title: `Import Job ${jobId} – AESTrak`,
  };
}

export default async function ImportJobDetailPage({ params }: ImportJobDetailPageProps) {
  const { jobId } = await params;
  const activeContext = await getActiveOrganization();

  if (!activeContext) {
    redirect('/login');
  }

  const job = await getImportJobById(jobId);

  if (!job) {
    notFound();
  }

  // Verify the job belongs to the current organization
  if (job.organizationId !== activeContext.membership.organizationId) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">
          <Link href="/imports" className="hover:text-foreground">
            Data / Import
          </Link>
          {' / '}
          <span>Job {jobId.slice(0, 8)}</span>
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Import Job Details</h1>
          <p className="text-sm text-muted-foreground">
            Review the details and results of this import job.
          </p>
        </div>
      </div>

      {/* Back Navigation */}
      <div>
        <Link
          href="/imports"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
        >
          ← Back to Imports
        </Link>
      </div>

      {/* Job Status */}
      <ImportJobStatus job={job} showDetails={true} />

      {/* Change Report */}
      {job.status === 'succeeded' && job.metadata && <ImportChangesReport job={job} />}

      {/* Auto-refresh for processing jobs */}
      {job.status === 'processing' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-700">
            This page will automatically refresh while the import is processing. You can safely
            navigate away and return later.
          </div>
        </div>
      )}

      {/* Error Details */}
      {job.status === 'failed' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-red-800 mb-2">Import Failed</h3>
          <div className="text-sm text-red-700">
            The import encountered an error and could not be completed. Please check your files and
            try again, or contact support if the issue persists.
          </div>
          {job.errorReportPath && (
            <div className="mt-3">
              <a
                href={job.errorReportPath}
                className="text-sm text-red-600 hover:text-red-700 underline"
              >
                Download Error Report
              </a>
            </div>
          )}
        </div>
      )}

      {/* Success Actions */}
      {job.status === 'succeeded' && job.metadata && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-800 mb-2">Import Completed Successfully</h3>
          <div className="text-sm text-green-700 space-y-2">
            <p>
              Your data has been imported successfully. Use the links above to review the new and
              updated records.
            </p>
            {(job.metadata.posNew > 0 || job.metadata.posUpdated > 0 || job.metadata.qsNew > 0) && (
              <div>
                <p className="font-medium">Next steps:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  {job.metadata.posNew > 0 && (
                    <li>Review {job.metadata.posNew} new purchase orders</li>
                  )}
                  {job.metadata.posUpdated > 0 && (
                    <li>
                      Check {job.metadata.posUpdated} updated purchase orders for utilization
                      changes
                    </li>
                  )}
                  {job.metadata.qsNew > 0 && (
                    <li>
                      Verify {job.metadata.qsNew.toLocaleString()} new quantity survey entries
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Re-import Option */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-foreground">Need to import more data?</h3>
            <p className="text-sm text-gray-600 mt-1">
              You can upload additional files or re-import updated data anytime.
            </p>
          </div>
          <Link
            href="/imports"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start New Import
          </Link>
        </div>
      </div>
    </div>
  );
}

// Auto-refresh for processing jobs
export const revalidate = 10; // Revalidate every 10 seconds
