import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCallDurationStatsRequest } from '@/store/slices/communicationSlice';
import { Card, Loader } from '@/components/common';
import { Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const CallDurationChart: React.FC = () => {
  const dispatch = useAppDispatch();
  const { callDurationStats, period, isLoadingCallDuration, callDurationError } = useAppSelector(
    (state) => state.communication
  );

  useEffect(() => {
    dispatch(fetchCallDurationStatsRequest({ period }));
  }, [dispatch, period]);

  if (isLoadingCallDuration) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader size="lg" />
      </div>
    );
  }

  if (callDurationError || !callDurationStats || callDurationStats.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-red-600 dark:text-red-400">{callDurationError || 'Failed to load call duration stats'}</p>
      </Card>
    );
  }

  // Get top 10 by total calls (create a copy to avoid mutating Redux state)
  const topAstrologers = [...callDurationStats]
    .sort((a, b) => (b.totalVoiceCalls + b.totalVideoCalls) - (a.totalVoiceCalls + a.totalVideoCalls))
    .slice(0, 10);

  // Format data for chart
  const chartData = topAstrologers.map((stat) => ({
    name: stat.astrologerName.length > 15 
      ? stat.astrologerName.substring(0, 15) + '...' 
      : stat.astrologerName,
    fullName: stat.astrologerName,
    voiceDuration: Number(stat.avgVoiceCallDuration.toFixed(1)),
    videoDuration: Number(stat.avgVideoCallDuration.toFixed(1)),
  }));

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-600" />
          <span>Average Call Duration by Astrologer</span>
        </div>
      }
    >
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
            />
            <YAxis
              label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
              labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
              formatter={(value: number) => `${value.toFixed(1)} min`}
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  return payload[0].payload.fullName;
                }
                return label;
              }}
            />
            <Legend
              formatter={(value) => (
                <span style={{ color: '#374151', fontSize: '14px' }}>{value}</span>
              )}
            />
            <Bar dataKey="voiceDuration" fill="#10b981" name="Voice Calls" />
            <Bar dataKey="videoDuration" fill="#8b5cf6" name="Video Calls" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

