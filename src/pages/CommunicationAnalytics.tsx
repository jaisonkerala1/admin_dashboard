import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setPeriod } from '@/store/slices/communicationSlice';
import type { CommunicationPeriod } from '@/types/communication';
import {
  CommunicationOverview,
  CommunicationTrends,
  AstrologerCommunicationChart,
  CallDurationChart,
  CallSuccessRateChart,
  PeakHoursChart,
} from '@/components/communication';
import { BarChart3, TrendingUp, Users, Phone } from 'lucide-react';

const tabs = [
  { id: 'overview', name: 'Overview', icon: BarChart3 },
  { id: 'trends', name: 'Trends', icon: TrendingUp },
  { id: 'astrologers', name: 'By Astrologer', icon: Users },
  { id: 'calls', name: 'Call Analytics', icon: Phone },
];

const periodOptions: { key: CommunicationPeriod; label: string }[] = [
  { key: '1d', label: '1 Day' },
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: '90d', label: '90 Days' },
  { key: '1y', label: '1 Year' },
];

export const CommunicationAnalytics = () => {
  const dispatch = useAppDispatch();
  const { period } = useAppSelector((state) => state.communication);
  const [activeTab, setActiveTab] = useState('overview');

  const handlePeriodChange = (newPeriod: CommunicationPeriod) => {
    dispatch(setPeriod(newPeriod));
  };

  return (
    <MainLayout>
      <PageHeader
        title="Communication Analytics"
        subtitle="Track messages, voice calls, and video calls from users to astrologers"
      />

      {/* Period Selector */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-6 overflow-x-auto">
          {periodOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => handlePeriodChange(opt.key)}
              className={`pb-3 px-1 border-b-2 whitespace-nowrap transition-colors ${
                period === opt.key
                  ? 'border-blue-500 text-blue-600 font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-1 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 font-semibold'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <>
            <CommunicationOverview />
          </>
        )}

        {activeTab === 'trends' && (
          <>
            <CommunicationTrends />
          </>
        )}

        {activeTab === 'astrologers' && (
          <>
            <AstrologerCommunicationChart />
          </>
        )}

        {activeTab === 'calls' && (
          <div className="space-y-6">
            <CallDurationChart />
            <CallSuccessRateChart />
            <PeakHoursChart />
          </div>
        )}
      </div>
    </MainLayout>
  );
};

