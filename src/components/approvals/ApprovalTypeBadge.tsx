import type { ApprovalRequestType } from '@/types/approval';
import { UserPlus, CheckCircle, Package, Edit } from 'lucide-react';

interface ApprovalTypeBadgeProps {
  type: ApprovalRequestType;
  size?: 'sm' | 'md';
}

export const ApprovalTypeBadge = ({ type, size = 'md' }: ApprovalTypeBadgeProps) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
  };

  const config = {
    onboarding: {
      icon: UserPlus,
      label: 'Onboarding',
      className: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    verification_badge: {
      icon: CheckCircle,
      label: 'Verification Badge',
      className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    service_approval: {
      icon: Package,
      label: 'Service Approval',
      className: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    profile_update: {
      icon: Edit,
      label: 'Profile Update',
      className: 'bg-gray-50 text-gray-700 border-gray-200',
    },
  };

  const { icon: Icon, label, className } = config[type];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${sizeClasses[size]} ${className}`}
    >
      <Icon className="w-3 h-3" size={iconSizes[size]} />
      {label}
    </span>
  );
};

