import React from 'react';
import type { TicketStatus } from '@/types/ticket';
import { CheckCircle, Clock, MessageCircle, XCircle } from 'lucide-react';

interface TicketStatusBadgeProps {
  status: TicketStatus;
  showIcon?: boolean;
}

export const TicketStatusBadge: React.FC<TicketStatusBadgeProps> = ({
  status,
  showIcon = true,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'open':
        return {
          label: 'Open',
          icon: Clock,
          className: 'bg-blue-50 text-blue-700 border border-blue-200',
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          icon: MessageCircle,
          className: 'bg-amber-50 text-amber-700 border border-amber-200',
        };
      case 'waiting_for_user':
        return {
          label: 'Waiting for User',
          icon: Clock,
          className: 'bg-purple-50 text-purple-700 border border-purple-200',
        };
      case 'closed':
        return {
          label: 'Closed',
          icon: CheckCircle,
          className: 'bg-gray-50 text-gray-700 border border-gray-200',
        };
      default:
        return {
          label: status,
          icon: XCircle,
          className: 'bg-gray-100 text-gray-800',
        };
    }
  };

  const config = getStatusConfig();
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

