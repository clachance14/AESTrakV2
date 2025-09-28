'use client';

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type UtilizationDistribution = {
  status: 'On Track' | 'Monitor' | 'Critical' | 'Over Auth';
  count: number;
};

type UtilizationDistributionChartProps = {
  data: UtilizationDistribution[];
  className?: string;
};

const statusColors = {
  'On Track': '#10b981',
  Monitor: '#f59e0b',
  Critical: '#fb923c',
  'Over Auth': '#ef4444',
};

const statusDescriptions = {
  'On Track': '< 75% billed',
  Monitor: '75-89% billed',
  Critical: '90-99% billed',
  'Over Auth': '≥ 100% billed',
};

export function UtilizationDistributionChart({
  data,
  className,
}: UtilizationDistributionChartProps) {
  // Transform data to include colors
  const chartData = data.map((item) => ({
    ...item,
    fill: statusColors[item.status],
  }));

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="status" tick={{ fontSize: 12, fill: '#64748b' }} />
          <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const status = label as keyof typeof statusDescriptions;
                return (
                  <div className="rounded-lg border bg-white p-3 shadow-md">
                    <p className="text-sm font-medium text-gray-900">{status}</p>
                    <p className="text-xs text-gray-600">{statusDescriptions[status]}</p>
                    <p className="text-sm font-semibold" style={{ color: statusColors[status] }}>
                      {payload[0].value} POs
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
