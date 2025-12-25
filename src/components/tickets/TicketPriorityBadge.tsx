import React from 'react';
import type { TicketPriority } from '@/types/ticket';
import { AlertTriangle, AlertCircle, Info, Flag } from 'lucide-react';

interface TicketPriorityBadgeProps {
  priority: TicketPriority;
  showIcon?: boolean;
}

export const TicketPriorityBadge: React.FC<TicketPriorityBadgeProps> = ({
  priority,
  showIcon = true,
}) => {
  const getPriorityConfig = () => {
    switch (priority) {
      case 'Urgent':
        return {
          label: 'Urgent',
          icon: AlertTriangle,
          className: 'bg-red-50 text-red-700 border border-red-200',
        };
      case 'High':
        return {
          label: 'High',
          icon: AlertCircle,
          className: 'bg-orange-50 text-orange-700 border border-orange-200',
        };
      case 'Medium':
        return {
          label: 'Medium',
          icon: Flag,
          className: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
        };
      case 'Low':
        return {
          label: 'Low',
          icon: Info,
          className: 'bg-green-50 text-green-700 border border-green-200',
        };
      default:
        return {
          label: priority,
          icon: Info,
          className: 'bg-gray-100 text-gray-800',
        };
    }
  };

  const config = getPriorityConfig();
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg ${config.className}`}
    >
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      {config.label}
    </span>
  );
};

