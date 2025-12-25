import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchStatsRequest } from '@/store/slices/communicationSlice';
import { Card, StatCard } from '@/components/common';
import { CommunicationOverviewSkeleton } from './CommunicationOverviewSkeleton';
import { MessageSquare, Phone, Video, TrendingUp, Clock, Users } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatNumber } from '@/utils/formatters';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6'];

export const CommunicationOverview: React.FC = () => {
  const dispatch = useAppDispatch();
  const { stats, period, communicationType, isLoadingStats, statsError } = useAppSelector(
    (state) => state.communication
  );

  useEffect(() => {
    dispatch(fetchStatsRequest({ period }));
  }, [dispatch, period, communicationType]);

  if (isLoadingStats) {
    return <CommunicationOverviewSkeleton />;
  }

  if (statsError || !stats) {
    return (
      <Card className="p-8 text-center">
        <p className="text-red-600 dark:text-red-400">{statsError || 'Failed to load stats'}</p>
      </Card>
    );
  }

  // Prepare pie chart data
  const pieData = [
    { name: 'Messages', value: stats.totalMessages },
    { name: 'Voice Calls', value: stats.totalVoiceCalls },
    { name: 'Video Calls', value: stats.totalVideoCalls },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Messages"
          value={formatNumber(stats.totalMessages)}
          icon={MessageSquare}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-50"
        />
        <StatCard
          title="Voice Calls"
          value={formatNumber(stats.totalVoiceCalls)}
          icon={Phone}
          iconColor="text-green-600"
          iconBgColor="bg-green-50"
        />
        <StatCard
          title="Video Calls"
          value={formatNumber(stats.totalVideoCalls)}
          icon={Video}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-50"
        />
        <StatCard
          title="Total Communications"
          value={formatNumber(stats.totalCommunications)}
          icon={TrendingUp}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-50"
        />
        <StatCard
          title="Avg Call Duration"
          value={`${stats.avgCallDuration.toFixed(1)} min`}
          icon={Clock}
          iconColor="text-amber-600"
          iconBgColor="bg-amber-50"
        />
        <StatCard
          title="Active Conversations"
          value={formatNumber(stats.activeConversations)}
          icon={Users}
          iconColor="text-teal-600"
          iconBgColor="bg-teal-50"
        />
      </div>

      {/* Communication Type Distribution */}
      <Card title="Communication Type Distribution">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 12px',
                }}
                formatter={(value: number) => formatNumber(value)}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span style={{ color: '#374151', fontSize: '14px' }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalMessages)}</p>
            <p className="text-sm text-gray-500">Messages</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalVoiceCalls)}</p>
            <p className="text-sm text-gray-500">Voice Calls</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalVideoCalls)}</p>
            <p className="text-sm text-gray-500">Video Calls</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

