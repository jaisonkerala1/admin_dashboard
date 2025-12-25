import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPeakHoursRequest } from '@/store/slices/communicationSlice';
import { Card, Loader } from '@/components/common';
import { Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatNumber } from '@/utils/formatters';

export const PeakHoursChart: React.FC = () => {
  const dispatch = useAppDispatch();
  const { peakHours, period, communicationType, isLoadingPeakHours, peakHoursError } = useAppSelector(
    (state) => state.communication
  );

  useEffect(() => {
    dispatch(fetchPeakHoursRequest({ period }));
  }, [dispatch, period, communicationType]);

  if (isLoadingPeakHours) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader size="lg" />
      </div>
    );
  }

  if (peakHoursError || !peakHours || peakHours.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-red-600 dark:text-red-400">{peakHoursError || 'Failed to load peak hours'}</p>
      </Card>
    );
  }

  // Format hour labels (0-23 to 12-hour format)
  const chartData = peakHours.map((hour) => ({
    ...hour,
    hourLabel: hour.hour === 0 
      ? '12 AM' 
      : hour.hour < 12 
      ? `${hour.hour} AM` 
      : hour.hour === 12 
      ? '12 PM' 
      : `${hour.hour - 12} PM`,
  }));

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-600" />
          <span>Peak Hours Analysis</span>
        </div>
      }
    >
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="hourLabel"
              tick={{ fontSize: 11 }}
              stroke="#9ca3af"
              interval={1}
            />
            <YAxis
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
              formatter={(value: number) => formatNumber(value)}
            />
            <Legend
              formatter={(value) => (
                <span style={{ color: '#374151', fontSize: '14px' }}>{value}</span>
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

