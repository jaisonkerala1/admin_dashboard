import React from 'react';
import { cn } from '@/utils/helpers';

export type AvailabilityStatus = 'available' | 'offline' | 'holiday' | 'unavailable';

const styles: Record<AvailabilityStatus, string> = {
  available: 'bg-green-50 text-green-700 border-green-200',
  offline: 'bg-gray-50 text-gray-700 border-gray-200',
  holiday: 'bg-amber-50 text-amber-700 border-amber-200',
  unavailable: 'bg-red-50 text-red-700 border-red-200',
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


