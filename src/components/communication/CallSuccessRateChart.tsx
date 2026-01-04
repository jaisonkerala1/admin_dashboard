import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchSuccessRateTrendsRequest } from '@/store/slices/communicationSlice';
import { Card } from '@/components/common';
import { ChartSkeleton } from '@/components/common';
import { CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';

export const CallSuccessRateChart: React.FC = () => {
  const dispatch = useAppDispatch();
  const { successRateTrends, period, communicationType, isLoadingSuccessRate, successRateError } = useAppSelector(
    (state) => state.communication
  );

  useEffect(() => {
    dispatch(fetchSuccessRateTrendsRequest({ period }));
  }, [dispatch, period, communicationType]);

  if (isLoadingSuccessRate) {
    return <ChartSkeleton height={320} type="line" />;
  }

  if (successRateError || !successRateTrends || successRateTrends.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-red-600 dark:text-red-400">{successRateError || 'Failed to load success rate trends'}</p>
      </Card>
    );
  }

  // Format dates for display
  const chartData = successRateTrends.map((trend) => ({
    ...trend,
    dateLabel: format(new Date(trend.date), period === '1d' ? 'HH:mm' : period === '7d' ? 'MMM d' : 'MMM d, yyyy'),
  }));

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500" />
          <span className="dark:text-foreground">Call Success Rate Trends</span>
        </div>
      }
    >
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
            <XAxis
              dataKey="dateLabel"
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              stroke="hsl(var(--muted))"
            />
            <YAxis
              label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              stroke="hsl(var(--muted))"
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
              labelStyle={{ fontWeight: 600, marginBottom: '4px', color: 'hsl(var(--muted-foreground))' }}
              itemStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number) => `${value.toFixed(1)}%`}
            />
            <Legend
              formatter={(value) => (
                <span style={{ color: 'hsl(var(--muted-foreground))', fontSize: '14px' }}>{value}</span>
              )}
            />
            <Line
              type="monotone"
              dataKey="completedRate"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 3 }}
              activeDot={{ r: 5 }}
              name="Completed"
            />
            <Line
              type="monotone"
              dataKey="missedRate"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: '#ef4444', r: 3 }}
              activeDot={{ r: 5 }}
              name="Missed"
            />
            <Line
              type="monotone"
              dataKey="rejectedRate"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ fill: '#f59e0b', r: 3 }}
              activeDot={{ r: 5 }}
              name="Rejected"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

