import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { WalletHeroCard, WalletQuickStats } from '@/components/wallet';
import { WalletOverview } from '@/components/wallet/WalletOverview';
import { WalletTransactions } from '@/components/wallet/WalletTransactions';
import { WalletAnalytics } from '@/components/wallet/WalletAnalytics';
import { WalletPayouts } from '@/components/wallet/WalletPayouts';
import { WalletHeroCardSkeleton, WalletQuickStatsSkeleton } from '@/components/wallet';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchWalletDataRequest, setPeriod } from '@/store/slices/walletSlice';
import { WalletPeriod } from '@/types/wallet';

export const Wallet = () => {
  const dispatch = useAppDispatch();
  const { period, data, isLoading, error } = useAppSelector((s) => s.wallet);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'analytics' | 'payouts'>('overview');

  useEffect(() => {
    dispatch(fetchWalletDataRequest({ period }));
  }, [dispatch, period]);

  const periodOptions: { key: WalletPeriod; label: string }[] = useMemo(
    () => [
      { key: 'today', label: 'Today' },
      { key: 'thisWeek', label: 'This Week' },
      { key: 'thisMonth', label: 'This Month' },
      { key: 'thisYear', label: 'This Year' },
    ],
    []
  );

  // Generate weekly trend data for hero card
  const weeklyTrendData = useMemo(() => {
    if (!data?.analytics?.weeklyTrend) {
      return Array.from({ length: 7 }, () => 500000);
    }
    return data.analytics.weeklyTrend.map((point) => point.total);
  }, [data]);

  if (error) {
    return (
      <MainLayout>
        <PageHeader title="Wallet" subtitle="Manage platform wallet and transactions" />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p>{error}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader title="Wallet" subtitle="Manage platform wallet and transactions" />

      <div className="space-y-4 lg:space-y-6">
        {/* Period Selector - Minimal Banking Style */}
        <div className="flex items-center justify-end">
          <select
            value={period}
            onChange={(e) => {
              const newPeriod = e.target.value as WalletPeriod;
              dispatch(setPeriod(newPeriod));
              dispatch(fetchWalletDataRequest({ period: newPeriod }));
            }}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {periodOptions.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Hero Card and Quick Stats - Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Hero Card */}
          {isLoading ? (
            <WalletHeroCardSkeleton />
          ) : data ? (
            <WalletHeroCard
              balance={data.balance}
              weeklyData={weeklyTrendData}
              isLoading={isLoading}
            />
          ) : null}

          {/* Quick Stats */}
          {isLoading ? (
            <WalletQuickStatsSkeleton />
          ) : data ? (
            <WalletQuickStats balance={data.balance} isLoading={isLoading} />
          ) : null}
        </div>

        {/* Tabs - Minimal Flat Design */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'transactions', label: 'Transactions' },
              { id: 'analytics', label: 'Analytics' },
              { id: 'payouts', label: 'Payouts' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 min-w-[100px] px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && data && (
            <WalletOverview
              balance={data.balance}
              stats={data.stats}
              recentTransactions={data.transactions.slice(0, 10)}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'transactions' && data && (
            <WalletTransactions transactions={data.transactions} isLoading={isLoading} />
          )}

          {activeTab === 'analytics' && data && (
            <WalletAnalytics analytics={data.analytics} isLoading={isLoading} />
          )}

          {activeTab === 'payouts' && data && (
            <WalletPayouts
              summary={data.payouts.summary}
              requests={data.payouts.requests}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
};

