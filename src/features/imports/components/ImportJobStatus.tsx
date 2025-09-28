import type { ImportJob } from '../form-state';

interface ImportJobStatusProps {
  job: ImportJob;
  showDetails?: boolean;
}

export function ImportJobStatus({ job, showDetails = false }: ImportJobStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return '✅';
      case 'failed':
        return '❌';
      case 'processing':
        return '⏳';
      case 'pending':
        return '⏸️';
      default:
        return '❓';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  return (
    <div className="space-y-4">
      {/* Status Header */}
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(job.status)}`}
        >
          {getStatusIcon(job.status)}
          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
        </span>

        {job.status === 'processing' && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-600">Processing...</span>
          </div>
        )}
      </div>

      {/* Metadata Summary */}
      {job.metadata && job.status === 'succeeded' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-700">{job.metadata.posNew}</div>
            <div className="text-sm text-green-600">New POs</div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-700">{job.metadata.posUpdated}</div>
            <div className="text-sm text-blue-600">Updated POs</div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-emerald-700">{job.metadata.qsNew}</div>
            <div className="text-sm text-emerald-600">New QS Entries</div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-700">
              {(
                job.metadata.posNew +
                job.metadata.posUpdated +
                job.metadata.qsNew
              ).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Changes</div>
          </div>
        </div>
      )}

      {/* Processing Details */}
      {showDetails && (
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-foreground mb-3">Import Details</h3>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-gray-500">File Name</dt>
                <dd className="text-sm text-foreground font-medium">{job.fileName || 'N/A'}</dd>
              </div>

              <div>
                <dt className="text-sm text-gray-500">Total Rows</dt>
                <dd className="text-sm text-foreground font-medium">
                  {job.rowCount?.toLocaleString() || 'N/A'}
                </dd>
              </div>

              <div>
                <dt className="text-sm text-gray-500">Started At</dt>
                <dd className="text-sm text-foreground font-medium">
                  {formatTimestamp(job.createdAt)}
                </dd>
              </div>

              <div>
                <dt className="text-sm text-gray-500">Completed At</dt>
                <dd className="text-sm text-foreground font-medium">
                  {job.status === 'processing' ? 'In progress...' : formatTimestamp(job.updatedAt)}
                </dd>
              </div>

              {job.metadata?.processingTimeMs && (
                <div>
                  <dt className="text-sm text-gray-500">Processing Time</dt>
                  <dd className="text-sm text-foreground font-medium">
                    {formatDuration(job.metadata.processingTimeMs)}
                  </dd>
                </div>
              )}

              {job.errorCount !== null && job.errorCount > 0 && (
                <div>
                  <dt className="text-sm text-gray-500">Errors</dt>
                  <dd className="text-sm text-red-600 font-medium">{job.errorCount} error(s)</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Detailed Breakdown */}
          {job.metadata && job.status === 'succeeded' && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-foreground mb-3">Change Summary</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-foreground">Purchase Orders</div>
                  <div className="text-sm text-gray-600 mt-1">
                    • {job.metadata.posNew} new POs added
                    <br />• {job.metadata.posUpdated} POs updated (utilization changed)
                    <br />• {job.metadata.posUnchanged} POs unchanged
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-foreground">Quantity Surveys</div>
                  <div className="text-sm text-gray-600 mt-1">
                    • {job.metadata.qsNew.toLocaleString()} new QS entries
                    <br />• {job.metadata.qsUnchanged.toLocaleString()} existing QS unchanged
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Links */}
          {job.metadata && job.status === 'succeeded' && (
            <div className="flex flex-wrap gap-3">
              {job.metadata.newPoIds.length > 0 && (
                <a
                  href={`/purchase-orders?import=${job.id}&filter=new`}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200 transition-colors"
                >
                  View New POs ({job.metadata.newPoIds.length})
                </a>
              )}

              {job.metadata.updatedPoIds.length > 0 && (
                <a
                  href={`/purchase-orders?import=${job.id}&filter=updated`}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200 transition-colors"
                >
                  View Updated POs ({job.metadata.updatedPoIds.length})
                </a>
              )}

              {job.metadata.newQsIds.length > 0 && (
                <a
                  href={`/quantity-surveys?import=${job.id}&filter=new`}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-md text-sm hover:bg-emerald-200 transition-colors"
                >
                  View New QS ({job.metadata.newQsIds.length})
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
