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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 lg:p-6 hover:shadow-md hover:border-gray-300 transition-all duration-200">
      {/* Card Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Summary</h3>

      {/* Account Information */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          You have <span className="font-semibold text-gray-900">{formatCurrency(totalInAccount)}</span> in your wallet
          {pendingAmount > 0 && (
            <span className="text-gray-500">
              {' '}with <span className="font-medium">{formatCurrency(pendingAmount)}</span> pending
            </span>
          )}
          .
        </p>

        {/* Earnings Increase with Orange Line Graph */}
        <div className="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-orange-900">
              {earningsIncrease}% increase in earnings
            </p>
            <div className="w-20 h-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#ea580c"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

