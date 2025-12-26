import { useEffect, useState } from 'react';
import { WalletBalance } from '@/types/wallet';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/utils/formatters';

interface WalletHeroCardProps {
  balance: WalletBalance;
  periodLabel: string;
  weeklyData: number[];
  isLoading?: boolean;
}

export const WalletHeroCard = ({ balance, periodLabel, weeklyData, isLoading }: WalletHeroCardProps) => {
  const [displayAmount, setDisplayAmount] = useState(0);

  // Animate count-up
  useEffect(() => {
    if (isLoading) {
      setDisplayAmount(0);
      return;
    }

    const duration = 1200;
    const steps = 60;
    const increment = balance.availableBalance / steps;
    const stepDuration = duration / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(increment * step, balance.availableBalance);
      setDisplayAmount(current);

      if (step >= steps) {
        clearInterval(timer);
        setDisplayAmount(balance.availableBalance);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [balance.availableBalance, isLoading]);

  // Prepare chart data
  const chartData = weeklyData.map((value, index) => ({
    value,
    index,
  }));

  // Calculate progress percentage (using totalBalance as max, or a reasonable limit)
  const maxBalance = balance.totalBalance || balance.availableBalance * 1.5;
  const progressPercentage = Math.min((balance.availableBalance / maxBalance) * 100, 100);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all duration-200">
      {/* Card Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Wallet Balance</h3>

      {/* Credit Card Style Display */}
      <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-5 mb-4 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-white/60 mb-1">Available Balance</p>
              <p className="text-2xl font-bold text-white">
                {isLoading ? '---' : formatCurrency(displayAmount)}
              </p>
            </div>
            {/* Mini Orange Line Chart */}
            <div className="w-24 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">
            {formatCurrency(balance.availableBalance)}
          </span>
          <span className="text-gray-500">
            / {formatCurrency(maxBalance)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button className="flex-1 px-4 py-2.5 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors font-medium text-sm">
          Process Payout
        </button>
        <button className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm">
          View Details
        </button>
      </div>
    </div>
  );
};

