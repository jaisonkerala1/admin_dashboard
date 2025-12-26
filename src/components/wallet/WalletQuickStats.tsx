import { WalletStats } from '@/types/wallet';
import { formatCurrency } from '@/utils/formatters';
import { ArrowDownCircle, ArrowUpCircle, Clock, Wallet } from 'lucide-react';

interface WalletQuickStatsProps {
  stats: WalletStats;
  isLoading?: boolean;
}

interface QuickStatItem {
  label: string;
  amount: number;
  icon: typeof ArrowDownCircle;
  color: string;
  bgColor: string;
}

export const WalletQuickStats = ({ stats, isLoading }: WalletQuickStatsProps) => {
  const quickStats: QuickStatItem[] = [
    {
      label: 'Total Deposits',
      amount: stats.totalDeposits,
      icon: ArrowDownCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Total Withdrawals',
      amount: stats.totalWithdrawals,
      icon: ArrowUpCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      label: 'Pending',
      amount: stats.pendingTransactions,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Transactions',
      amount: stats.transactionCount,
      icon: Wallet,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ];

  const formatAmount = (amount: number, isCount = false) => {
    if (isCount) {
      if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1)}M`;
      } else if (amount >= 1000) {
        return `${(amount / 1000).toFixed(1)}K`;
      }
      return amount.toString();
    }
    return formatCurrency(amount);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-5 w-32 bg-gray-200 rounded shimmer" />
        <div className="flex gap-3 overflow-x-auto pb-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="min-w-[100px] flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 p-4"
            >
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 bg-gray-200 rounded-full shimmer mb-2" />
                <div className="h-3 w-12 bg-gray-200 rounded shimmer mb-1" />
                <div className="h-4 w-16 bg-gray-200 rounded shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          const isCount = stat.label === 'Pending' || stat.label === 'Transactions';
          
          return (
            <div
              key={index}
              className="min-w-[100px] flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 ${stat.bgColor} rounded-full flex items-center justify-center mb-2`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-xs font-medium text-gray-600 mb-1 text-center">{stat.label}</p>
                <p className={`text-sm font-bold ${stat.color} text-center`}>
                  {isCount ? formatAmount(stat.amount, true) : formatAmount(stat.amount)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

