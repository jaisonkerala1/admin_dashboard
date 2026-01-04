import React from 'react';
import { cn } from '@/utils/helpers';

export type AvailabilityStatus = 'available' | 'offline' | 'holiday' | 'unavailable';

const styles: Record<AvailabilityStatus, string> = {
  available: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
  offline: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-border',
  holiday: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  unavailable: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
};

const labels: Record<AvailabilityStatus, string> = {
  available: 'Available',
  offline: 'Offline',
  holiday: 'Holiday',
  unavailable: 'Unavailable',
};

export const AvailabilityStatusBadge: React.FC<{ status: AvailabilityStatus; className?: string }> = ({
  status,
  className,
}) => {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full border', styles[status], className)}>
      {labels[status]}
    </span>
  );
};



