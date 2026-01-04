import React from 'react';
import type { Holiday } from '@/types';

export const HolidayBadge: React.FC<{ holiday: Holiday }> = ({ holiday }) => {
  const date = new Date(holiday.date);
  const label = `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • ${holiday.reason}`;
  return (
    <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full border bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800">
      {label}
    </span>
  );
};



