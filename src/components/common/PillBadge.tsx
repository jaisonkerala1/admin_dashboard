import React from 'react';

export type BadgeVariant =
  | 'online'
  | 'offline'
  | 'busy'
  | 'on-call'
  | 'inactive'
  // generic colors
  | 'blue'
  | 'purple'
  // approvals / generic
  | 'pending'
  | 'active'
  | 'approved'
  | 'rejected'
  // service-request statuses
  | 'confirmed'
  | 'inProgress'
  | 'completed'
  | 'cancelled'
  // consultation statuses
  | 'scheduled'
  | 'noShow';

interface PillBadgeProps {
  variant: BadgeVariant;
  label?: string;
  showDot?: boolean;
  className?: string;
  title?: string;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
  online: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    dot: 'bg-green-500'
  },
  offline: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    dot: 'bg-gray-400'
  },
  busy: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    dot: 'bg-amber-500'
  },
  'on-call': {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    dot: 'bg-blue-500'
  },
  inactive: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    dot: 'bg-red-500'
  },
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    dot: 'bg-blue-500'
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    dot: 'bg-purple-500'
  },
  pending: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    dot: 'bg-yellow-500'
  },
  confirmed: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    dot: 'bg-blue-500'
  },
  inProgress: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    dot: 'bg-purple-500'
  },
  completed: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    dot: 'bg-green-500'
  },
  cancelled: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    dot: 'bg-gray-400'
  },
  scheduled: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    dot: 'bg-yellow-500'
  },
  noShow: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    dot: 'bg-gray-400'
  },
  active: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    dot: 'bg-green-500'
  },
  approved: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    dot: 'bg-blue-500'
  },
  rejected: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    dot: 'bg-red-500'
  }
};

const defaultLabels: Record<BadgeVariant, string> = {
  online: 'Online',
  offline: 'Offline',
  busy: 'Busy',
  'on-call': 'On Call',
  inactive: 'Inactive',
  blue: 'Info',
  purple: 'Info',
  pending: 'Pending',
  confirmed: 'Confirmed',
  inProgress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  scheduled: 'Scheduled',
  noShow: 'No Show',
  active: 'Active',
  approved: 'Approved',
  rejected: 'Rejected'
};

export const PillBadge: React.FC<PillBadgeProps> = ({ 
  variant, 
  label, 
  showDot = true,
  className = '',
  title
}) => {
  const styles = variantStyles[variant];
  const displayLabel = label || defaultLabels[variant];

  return (
    <span 
      title={title}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${styles.bg} ${styles.text} ${className}`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 ${styles.dot} rounded-full`} />
      )}
      {displayLabel}
    </span>
  );
};



