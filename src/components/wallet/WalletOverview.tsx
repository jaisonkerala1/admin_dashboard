import { WalletTransaction, WalletBalance, WalletStats } from '@/types/wallet';
import { WalletTransactionCard } from './WalletTransactionCard';
import { Card } from '@/components/common';
import { formatCurrency } from '@/utils/formatters';
import { Users, Wallet, Clock, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface WalletOverviewProps {
  balance: WalletBalance;
  stats: WalletStats;
  recentTransactions: WalletTransaction[];
  isLoading?: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

export const WalletOverview = ({ balance, stats, recentTransactions, isLoading }: WalletOverviewProps) => {
  // Balance distribution data (mock - would come from backend)
  const distributionData = [
    { name: 'User Wallets', value: balance.totalBalance * 0.6 },
    { name: 'Astrologer Wallets', value: balance.totalBalance * 0.3 },
    { name: 'Platform Reserve', value: balance.totalBalance * 0.1 },
  ];

  const handleCopyTransactionId = (id: string) => {
    navigator.clipboard.writeText(id);
    // Could show a toast notification here
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-5">
              <div className="h-20 bg-gray-200 rounded shimmer" />
            </Card>
          ))}
        </div>
        <Card className="p-6">
          <div className="h-64 bg-gray-200 rounded shimmer" />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Wallets</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeWallets.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Balance</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(balance.totalBalance)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Settlements</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(balance.pendingBalance)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Balance Distribution Chart */}
      <Card title="Balance Distribution" subtitle="Breakdown by wallet type">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {distributionData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recent Transactions */}
      <Card
        title="Recent Transactions"
        subtitle="Latest wallet activity"
        action={
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All
          </button>
        }
      >
        {recentTransactions.length === 0 ? (
          <div className="text-center py-12">
            <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No transactions yet</p>
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
      </Card>
    </div>
  );
};

