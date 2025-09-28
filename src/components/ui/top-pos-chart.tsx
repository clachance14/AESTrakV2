'use client';

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { formatCurrency } from '@/libs/formatters';

type TopPO = {
  id: string;
  purchaseOrderNo: string;
  orderShortText: string | null;
  totalSpent: number;
  utilizationPercent: number;
};

type TopPOsChartProps = {
  data: TopPO[];
  className?: string;
};

function abbreviatePONumber(poNumber: string): string {
  // Handle numbers that might have decimals
  const beforeDecimal = poNumber.split('.')[0];

  // Show the last 5 digits before decimal since most start with "6500"
  if (beforeDecimal.length > 5) {
    return `#${beforeDecimal.slice(-5)}`;
  }

  // For shorter numbers, just add # prefix
  return `#${beforeDecimal}`;
}

function formatCompactCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

export function TopPOsChart({ data, className }: TopPOsChartProps) {
  // Transform data for the chart - use abbreviated PO number for display
  const chartData = data.map((po, index) => {
    const displayName = abbreviatePONumber(po.purchaseOrderNo);

    return {
      ...po,
      displayName,
      // Make displayName unique by adding index if there are duplicates
      uniqueDisplayName: `${displayName}-${index}`,
      fill:
        po.utilizationPercent >= 100
          ? '#ef4444'
          : po.utilizationPercent >= 90
            ? '#fb923c'
            : po.utilizationPercent >= 75
              ? '#f59e0b'
              : '#10b981',
      // Add rank for better ordering
      rank: index + 1,
    };
  });

  // Check for duplicate display names and ensure uniqueness
  const displayNameCounts = new Map<string, number>();
  chartData.forEach((item) => {
    const count = displayNameCounts.get(item.displayName) || 0;
    displayNameCounts.set(item.displayName, count + 1);
  });

  // Update display names to be unique if duplicates exist
  const finalChartData = chartData.map((item) => {
    if (displayNameCounts.get(item.displayName)! > 1) {
      return {
        ...item,
        displayName: `${item.displayName}.${item.rank}`,
      };
    }
    return item;
  });

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={finalChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <XAxis
            dataKey="displayName"
            tick={{ fontSize: 11, fill: '#64748b' }}
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickFormatter={(value) => formatCompactCurrency(value)}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const po = payload[0].payload as TopPO & { displayName: string; rank: number };
                return (
                  <div className="rounded-lg border bg-white p-3 shadow-md">
                    <p className="text-sm font-medium text-gray-900">
                      #{po.rank} - {po.purchaseOrderNo}
                    </p>
                    <p className="text-xs text-gray-600 mb-2">
                      {po.orderShortText || 'No description'}
                    </p>
                    <p className="text-sm text-blue-600 font-semibold">
                      Total Invoiced: {formatCurrency(po.totalSpent)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Utilization: {po.utilizationPercent.toFixed(1)}%
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="totalSpent" radius={[4, 4, 0, 0]}>
            {finalChartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
