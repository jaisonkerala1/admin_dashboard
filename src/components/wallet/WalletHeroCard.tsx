import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { WalletBalance } from '@/types/wallet';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

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

  const formatAmount = (amount: number) => {
    if (amount >= 10000000) {
      return `${(amount / 10000000).toFixed(2)}Cr`;
    } else if (amount >= 100000) {
      return `${(amount / 100000).toFixed(2)}L`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toFixed(0);
  };

  return (
    <div className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 h-[200px] overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-[-30px] right-[-30px] w-32 h-32 bg-white/10 rounded-full" />
      <div className="absolute bottom-[-40px] left-[-20px] w-24 h-24 bg-white/8 rounded-full" />

      {/* Subtle shimmer effect overlay */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" style={{
          animation: 'shimmer 2s infinite',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
        }} />
      </div>

      <div className="relative z-10 h-full flex flex-col justify-between text-white">
        {/* Top row: Period label & Mini chart */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-white/80 tracking-wide">{periodLabel}</p>
            <p className="text-xs text-white/60 mt-0.5">Wallet Balance</p>
          </div>
          
          {/* Mini Area Chart */}
          <div className="w-[90px] h-[45px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="walletGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="rgba(255,255,255,0.9)"
                  strokeWidth={2}
                  fill="url(#walletGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Main balance amount */}
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-medium text-white/90">₹</span>
            <span className="text-4xl font-bold tracking-tight">
              {isLoading ? '---' : formatAmount(displayAmount)}
            </span>
          </div>
        </div>

        {/* Bottom row: Growth indicator & Pending balance */}
        <div className="flex items-center justify-between">
          {/* Growth badge */}
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-xl ${
                balance.growthPercentage >= 0
                  ? 'bg-white/20 backdrop-blur-sm'
                  : 'bg-red-500/30 backdrop-blur-sm'
              }`}
            >
              {balance.growthPercentage >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span className="text-xs font-semibold">
                {balance.growthPercentage >= 0 ? '+' : ''}
                {balance.growthPercentage.toFixed(1)}%
              </span>
            </div>
            <span className="text-xs text-white/60">vs last period</span>
          </div>

          {/* Pending balance */}
          {balance.pendingBalance > 0 && (
            <div className="text-right">
              <p className="text-xs text-white/60">Pending</p>
              <p className="text-sm font-semibold text-white/90">
                ₹{formatAmount(balance.pendingBalance)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

