import { useMemo } from 'react';

interface BoostProgressBarProps {
  startDate: string;
  endDate: string;
  className?: string;
}

export const BoostProgressBar = ({
  startDate,
  endDate,
  className = '',
}: BoostProgressBarProps) => {
  const { percentage, color } = useMemo(() => {
    const now = new Date().getTime();
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const total = end - start;
    const elapsed = now - start;

    if (total <= 0 || elapsed < 0) {
      return { percentage: 0, color: 'bg-gray-300' };
    }

    if (elapsed >= total) {
      return { percentage: 100, color: 'bg-red-500' };
    }

    const percent = (elapsed / total) * 100;

    // Color coding: green (>50%), yellow (25-50%), red (<25%)
    let barColor = 'bg-green-500';
    if (percent < 25) {
      barColor = 'bg-red-500';
    } else if (percent < 50) {
      barColor = 'bg-yellow-500';
    }

    return { percentage: Math.min(100, Math.max(0, percent)), color: barColor };
  }, [startDate, endDate]);

  return (
    <div className={`w-full ${className}`}>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`${color} h-2.5 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="mt-1 text-xs text-gray-600 text-right">
        {percentage.toFixed(1)}% elapsed
      </div>
    </div>
  );
};

