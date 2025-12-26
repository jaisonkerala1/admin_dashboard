import { useEffect, useState } from 'react';
import { WalletBalance } from '@/types/wallet';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/utils/formatters';

interface WalletHeroCardProps {
  balance: WalletBalance;
  weeklyData: number[];
  isLoading?: boolean;
  onProcessPayout?: () => void;
}

export const WalletHeroCard = ({ balance, weeklyData, isLoading, onProcessPayout }: WalletHeroCardProps) => {
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200">
      {/* Card Title */}
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Available Balance</h3>

      {/* Compact Credit Card Style Display */}
      <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 mb-3 overflow-hidden" style={{ aspectRatio: '2.5' }}>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-8 -mb-8" />
        
        <div className="relative z-10 h-full flex items-center justify-between">
          <div>
            <p className="text-xs text-white/60 mb-0.5">Available Balance</p>
            <p className="text-xl font-bold text-white">
              {isLoading ? '---' : formatCurrency(displayAmount)}
            </p>
          </div>
          {/* Mini Orange Line Chart */}
          <div className="w-20 h-10">
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

      {/* Compact Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-gray-600">
            {formatCurrency(balance.availableBalance)}
          </span>
          <span className="text-gray-500">
            / {formatCurrency(maxBalance)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Compact Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onProcessPayout}
          className="flex-1 px-3 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors font-medium text-xs"
        >
          Process Payout
        </button>
        <button className="flex-1 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-xs">
          View Details
        </button>
      </div>
    </div>
  );
};

