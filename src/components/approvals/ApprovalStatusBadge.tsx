import type { ApprovalStatus } from '@/types/approval';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

interface ApprovalStatusBadgeProps {
  status: ApprovalStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const ApprovalStatusBadge = ({ status, size = 'md' }: ApprovalStatusBadgeProps) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  if (status === 'pending') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses[size]} bg-orange-50 text-orange-700 border border-orange-200`}
      >
        <Clock className="w-3 h-3" size={iconSizes[size]} />
        Pending
      </span>
    );
  }

  if (status === 'approved') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses[size]} bg-green-50 text-green-700 border border-green-200`}
      >
        <CheckCircle2 className="w-3 h-3" size={iconSizes[size]} />
        Approved
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses[size]} bg-red-50 text-red-700 border border-red-200`}
    >
      <XCircle className="w-3 h-3" size={iconSizes[size]} />
      Rejected
    </span>
  );
};

