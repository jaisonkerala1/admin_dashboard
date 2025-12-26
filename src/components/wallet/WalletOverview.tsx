import { WalletTransaction, WalletBalance, WalletStats } from '@/types/wallet';
import { WalletTransactionCard } from './WalletTransactionCard';
import { formatCurrency } from '@/utils/formatters';
import { Users, Wallet, Clock, Filter } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

interface WalletOverviewProps {
  balance: WalletBalance;
  stats: WalletStats;
  recentTransactions: WalletTransaction[];
  isLoading?: boolean;
}

export const WalletOverview = ({ balance, stats, recentTransactions, isLoading }: WalletOverviewProps) => {
  // Generate earnings trend data for orange line chart
  const now = new Date();
  const startDate = startOfMonth(now);
  const endDate = endOfMonth(now);
  const dateRange = `${format(startDate, 'd MMM')} - ${format(endDate, 'd MMM. yyyy')}`;

  // Generate trend data (mock - would come from backend)
  const earningsTrendData = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(now, 29 - i);
    return {
      date: format(date, 'd MMM'),
      earnings: 50000 + Math.random() * 20000 + i * 1000,
    };
  });

  const earningsIncrease = 74; // Mock percentage

  const handleCopyTransactionId = (id: string) => {
    navigator.clipboard.writeText(id);
  };

  // Get recent transactions date range
  const getRecentTransactionsDateRange = () => {
    if (recentTransactions.length === 0) return '';
    const dates = recentTransactions.map(t => new Date(t.timestamp));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    return `${format(minDate, 'd')} - ${format(maxDate, 'd MMM. yyyy')}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 lg:p-6">
          <div className="h-64 bg-gray-200 rounded shimmer" />
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 lg:p-6">
          <div className="h-64 bg-gray-200 rounded shimmer" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats Cards - Minimal Flat Design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-5 hover:shadow-md hover:border-gray-300 transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 mb-0.5">Active Wallets</p>
              <p className="text-xl font-bold text-gray-900 truncate">{stats.activeWallets.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-5 hover:shadow-md hover:border-gray-300 transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Wallet className="w-5 h-5 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 mb-0.5">Total Balance</p>
              <p className="text-xl font-bold text-gray-900 truncate">{formatCurrency(balance.totalBalance)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-5 hover:shadow-md hover:border-gray-300 transition-all duration-200 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 mb-0.5">Pending Settlements</p>
              <p className="text-xl font-bold text-gray-900 truncate">{formatCurrency(balance.pendingBalance)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Card with Orange Line Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 lg:p-6 hover:shadow-md hover:border-gray-300 transition-all duration-200">
        {/* Card Header with Date Range and Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Your Statistics</h3>
            <p className="text-xs text-gray-500 mt-0.5">{dateRange}</p>
          </div>
          <div className="flex items-center gap-2">
            <select className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>Month</option>
              <option>Week</option>
              <option>Year</option>
            </select>
            <button className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Earnings Increase with Orange Line Chart */}
        <div className="mb-4">
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {earningsIncrease}% increase in earnings
          </p>
        </div>

        {/* Orange Line Chart */}
        <div className="h-48 lg:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={earningsTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                stroke="#9ca3af"
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                stroke="#9ca3af"
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Line
                type="monotone"
                dataKey="earnings"
                stroke="#ea580c"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 lg:p-6 hover:shadow-md hover:border-gray-300 transition-all duration-200">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <p className="text-xs text-gray-500 mt-0.5">{getRecentTransactionsDateRange()}</p>
          </div>
          <select className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto">
            <option>Week</option>
            <option>Month</option>
            <option>Year</option>
          </select>
        </div>

        {/* Transaction List */}
        {recentTransactions.length === 0 ? (
          <div className="text-center py-12">
            <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.slice(0, 10).map((transaction) => (
              <WalletTransactionCard
                key={transaction.id}
                transaction={transaction}
                onCopy={handleCopyTransactionId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

