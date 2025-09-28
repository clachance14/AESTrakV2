'use client';

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { formatCurrency, formatDate } from '@/libs/formatters';

function formatCompactCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

type BillingTrendData = {
  date: string;
  total: number;
};

type BillingTrendChartProps = {
  data: BillingTrendData[];
  interval?: 'daily' | 'weekly' | 'monthly';
  className?: string;
};

function formatLabel(date: string, interval: 'daily' | 'weekly' | 'monthly') {
  if (!date) {
    return date;
  }

  const iso = `${date}T00:00:00.000Z`;

  if (interval === 'monthly') {
    const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' });
    return formatter.format(new Date(iso));
  }

  if (interval === 'weekly') {
    const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
    return formatter.format(new Date(iso));
  }

  return formatDate(iso, { fallback: date });
}

export function BillingTrendChart({ data, interval = 'daily', className }: BillingTrendChartProps) {
  const calculateTickCount = () => {
    if (data.length <= 7) return data.length;
    if (data.length <= 14) return Math.min(7, data.length);
    if (data.length <= 30) return Math.min(8, data.length);
    return Math.min(10, data.length);
  };

  const tickCount = calculateTickCount();

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="billingGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickFormatter={(value) => formatLabel(value as string, interval)}
            tickCount={tickCount}
            domain={['dataMin', 'dataMax']}
            type="category"
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickFormatter={(value) => formatCompactCurrency(value)}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-white p-3 shadow-md">
                    <p className="text-sm font-medium text-gray-900">
                      {formatLabel(label as string, interval)}
                    </p>
                    <p className="text-sm text-blue-600">
                      Billing: {formatCurrency(payload[0].value as number)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#billingGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
