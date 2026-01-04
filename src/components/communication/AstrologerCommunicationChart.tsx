import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAstrologerStatsRequest } from '@/store/slices/communicationSlice';
import { Card } from '@/components/common';
import { ChartSkeleton } from '@/components/common';
import { Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatNumber } from '@/utils/formatters';

export const AstrologerCommunicationChart: React.FC = () => {
  const dispatch = useAppDispatch();
  const { astrologerStats, period, communicationType, isLoadingAstrologerStats, astrologerStatsError } = useAppSelector(
    (state) => state.communication
  );
  const [topN, setTopN] = useState(10);

  useEffect(() => {
    dispatch(fetchAstrologerStatsRequest({ period }));
  }, [dispatch, period, communicationType]);

  if (isLoadingAstrologerStats) {
    return <ChartSkeleton height={384} type="bar" />;
  }

  if (astrologerStatsError || !astrologerStats || astrologerStats.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-red-600 dark:text-red-400">{astrologerStatsError || 'Failed to load astrologer stats'}</p>
      </Card>
    );
  }

  // Get top N astrologers
  const topAstrologers = astrologerStats.slice(0, topN);

  // Format data for chart (truncate long names)
  const chartData = topAstrologers.map((stat) => ({
    name: stat.astrologerName.length > 15 
      ? stat.astrologerName.substring(0, 15) + '...' 
      : stat.astrologerName,
    fullName: stat.astrologerName,
    messages: stat.messages,
    voiceCalls: stat.voiceCalls,
    videoCalls: stat.videoCalls,
    total: stat.total,
  }));

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600 dark:text-primary-400" />
            <span className="dark:text-foreground">Communication by Astrologer</span>
          </div>
          <select
            value={topN}
            onChange={(e) => setTopN(Number(e.target.value))}
            className="text-sm border border-gray-300 dark:border-border rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-card dark:text-foreground"
          >
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={15}>Top 15</option>
            <option value={20}>Top 20</option>
          </select>
        </div>
      }
    >
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
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
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  return payload[0].payload.fullName;
                }
                return label;
              }}
            />
            <Legend
              formatter={(value) => (
                <span style={{ color: 'hsl(var(--muted-foreground))', fontSize: '14px' }}>{value}</span>
              )}
            />
            <Bar dataKey="messages" stackId="a" fill="#3b82f6" name="Messages" />
            <Bar dataKey="voiceCalls" stackId="a" fill="#10b981" name="Voice Calls" />
            <Bar dataKey="videoCalls" stackId="a" fill="#8b5cf6" name="Video Calls" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

