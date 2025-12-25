import { useState } from 'react';
import { MainLayout } from '@/components/layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setPeriod, setCommunicationType } from '@/store/slices/communicationSlice';
import type { CommunicationPeriod, CommunicationType } from '@/types/communication';
import {
  CommunicationOverview,
  CommunicationTrends,
  AstrologerCommunicationChart,
  CallDurationChart,
  CallSuccessRateChart,
  PeakHoursChart,
} from '@/components/communication';
import { BarChart3, TrendingUp, Users, Phone, ChevronDown } from 'lucide-react';

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

const communicationTypeOptions: { key: CommunicationType; label: string }[] = [
  { key: 'customer-astrologer', label: 'Customer ↔ Astrologer' },
  { key: 'admin-astrologer', label: 'Admin ↔ Astrologer' },
];

export const CommunicationAnalytics = () => {
  const dispatch = useAppDispatch();
  const { period, communicationType } = useAppSelector((state) => state.communication);
  const [activeTab, setActiveTab] = useState('overview');

  const handlePeriodChange = (newPeriod: CommunicationPeriod) => {
    dispatch(setPeriod(newPeriod));
  };

  const handleCommunicationTypeChange = (newType: CommunicationType) => {
    dispatch(setCommunicationType(newType));
  };

  return (
    <MainLayout>
      <PageHeader
        title="Communication Analytics"
        subtitle="Track messages, voice calls, and video calls between customers and astrologers"
      />

      {/* Filters Section */}
      <div className="mb-6">
        <div className="border-b border-gray-200 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Period Selector */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Time Period:</span>
              <div className="flex gap-4 overflow-x-auto">
                {periodOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => handlePeriodChange(opt.key)}
                    className={`pb-2 px-2 border-b-2 whitespace-nowrap transition-colors text-sm ${
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

            {/* Communication Type Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">View:</span>
              <div className="relative">
                <select
                  value={communicationType}
                  onChange={(e) => handleCommunicationTypeChange(e.target.value as CommunicationType)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-1.5 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer transition-colors"
                >
                  {communicationTypeOptions.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>
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

