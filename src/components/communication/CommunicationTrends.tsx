import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchTrendsRequest } from '@/store/slices/communicationSlice';
import { Card } from '@/components/common';
import { CommunicationTrendsSkeleton } from './CommunicationTrendsSkeleton';
import { TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatNumber } from '@/utils/formatters';
import { format } from 'date-fns';

export const CommunicationTrends: React.FC = () => {
  const dispatch = useAppDispatch();
  const { trends, period, communicationType, isLoadingTrends, trendsError } = useAppSelector(
    (state) => state.communication
  );

  useEffect(() => {
    dispatch(fetchTrendsRequest({ period }));
  }, [dispatch, period, communicationType]);

  if (isLoadingTrends) {
    return <CommunicationTrendsSkeleton />;
  }

  if (trendsError || !trends || trends.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-red-600 dark:text-red-400">{trendsError || 'Failed to load trends'}</p>
      </Card>
    );
  }

  // Format dates for display
  const chartData = trends.map((trend) => ({
    ...trend,
    dateLabel: format(new Date(trend.date), period === '1d' ? 'HH:mm' : period === '7d' ? 'MMM d' : 'MMM d, yyyy'),
  }));

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-primary-400" />
          <span className="dark:text-foreground">Communication Trends</span>
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
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              stroke="hsl(var(--muted))"
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
              formatter={(value: number) => formatNumber(value)}
            />
            <Legend
              formatter={(value) => (
                <span style={{ color: 'hsl(var(--muted-foreground))', fontSize: '14px' }}>{value}</span>
              )}
            />
            <Line
              type="monotone"
              dataKey="messages"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 3 }}
              activeDot={{ r: 5 }}
              name="Messages"
            />
            <Line
              type="monotone"
              dataKey="voiceCalls"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 3 }}
              activeDot={{ r: 5 }}
              name="Voice Calls"
            />
            <Line
              type="monotone"
              dataKey="videoCalls"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ fill: '#8b5cf6', r: 3 }}
              activeDot={{ r: 5 }}
              name="Video Calls"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

