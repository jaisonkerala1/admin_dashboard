import { WalletBalance } from '@/types/wallet';
import { formatCurrency } from '@/utils/formatters';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface WalletQuickStatsProps {
  balance?: WalletBalance;
  isLoading?: boolean;
}

export const WalletQuickStats = ({ balance, isLoading }: WalletQuickStatsProps) => {
  // Generate trend data for the orange line graph
  const trendData = Array.from({ length: 7 }, (_, i) => ({
    day: i,
    value: 100 + Math.random() * 50,
  }));

  // Calculate earnings increase percentage (mock calculation)
  const earningsIncrease = 48; // This would come from actual data comparison

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 lg:p-6">
        <div className="h-5 w-48 bg-gray-200 rounded shimmer mb-4" />
        <div className="h-20 bg-gray-200 rounded shimmer mb-4" />
        <div className="h-16 bg-gray-200 rounded shimmer" />
      </div>
    );
  }

  const totalInAccount = balance?.totalBalance || 0;
  const pendingAmount = balance?.pendingBalance || 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200">
      {/* Card Title */}
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Account Summary</h3>

      {/* Compact Account Information */}
      <div className="space-y-3">
        <div>
          <p className="text-xs text-gray-500 mb-1">Total Balance</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(totalInAccount)}
          </p>
          {pendingAmount > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {formatCurrency(pendingAmount)} pending
            </p>
          )}
        </div>

        {/* Earnings Growth with Large Orange Line Graph */}
        <div className="pt-3 border-t border-gray-100">
          <div className="mb-2">
            <p className="text-xs text-gray-500 mb-0.5">Earnings Growth</p>
            <p className="text-sm font-semibold text-orange-900">
              +{earningsIncrease}%
            </p>
          </div>
          {/* Large Graph Starting from Left */}
          <div className="w-full h-20 -ml-2 -mr-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#ea580c"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

