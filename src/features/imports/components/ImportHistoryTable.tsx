import Link from 'next/link';

import type { ImportJob } from '../form-state';

interface ImportHistoryTableProps {
  jobs: ImportJob[];
}

export function ImportHistoryTable({ jobs }: ImportHistoryTableProps) {
  const getStatusBadge = (status: string) => {
    const baseClasses = 'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium';

    switch (status) {
      case 'succeeded':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'processing':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
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

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const getChangeSummary = (job: ImportJob) => {
    if (!job.metadata || job.status !== 'succeeded') {
      return '—';
    }

    const { posNew, posUpdated, qsNew } = job.metadata;
    const totalChanges = posNew + posUpdated + qsNew;

    if (totalChanges === 0) {
      return 'No changes';
    }

    const parts = [];
    if (posNew > 0) parts.push(`${posNew} new PO${posNew > 1 ? 's' : ''}`);
    if (posUpdated > 0) parts.push(`${posUpdated} updated PO${posUpdated > 1 ? 's' : ''}`);
    if (qsNew > 0) parts.push(`${qsNew.toLocaleString()} new QS`);

    return parts.join(', ');
  };

  if (jobs.length === 0) {
    return (
      <div className="border border-gray-200 rounded-lg p-8 text-center">
        <div className="text-gray-500 text-sm">
          No import history yet. Upload your first Excel files to get started.
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Files
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Changes
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rows
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {jobs.map((job) => {
              const { date, time } = formatDateTime(job.createdAt);

              return (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={getStatusBadge(job.status)}>
                      {getStatusIcon(job.status)}
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-foreground">{date}</div>
                    <div className="text-xs text-gray-500">{time}</div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="text-sm text-foreground max-w-xs truncate">
                      {job.fileName || 'Multiple files'}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="text-sm text-foreground max-w-xs">{getChangeSummary(job)}</div>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-foreground">
                      {job.rowCount ? job.rowCount.toLocaleString() : '—'}
                    </div>
                    {job.errorCount && job.errorCount > 0 && (
                      <div className="text-xs text-red-600">
                        {job.errorCount} error{job.errorCount > 1 ? 's' : ''}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link
                      href={`/imports/${job.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
