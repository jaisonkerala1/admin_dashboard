import React from 'react';
import type { TicketCategory } from '@/types/ticket';
import {
  User,
  Calendar,
  MessageSquare,
  CreditCard,
  Wrench,
  Lightbulb,
  Bug,
  HelpCircle,
} from 'lucide-react';

interface TicketCategoryBadgeProps {
  category: TicketCategory;
  showIcon?: boolean;
}

export const TicketCategoryBadge: React.FC<TicketCategoryBadgeProps> = ({
  category,
  showIcon = true,
}) => {
  const getCategoryConfig = () => {
    switch (category) {
      case 'Account Issues':
        return {
          label: 'Account Issues',
          icon: User,
          className: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
        };
      case 'Calendar Problems':
        return {
          label: 'Calendar Problems',
          icon: Calendar,
          className: 'bg-teal-50 text-teal-700 border border-teal-200',
        };
      case 'Consultation Issues':
        return {
          label: 'Consultation Issues',
          icon: MessageSquare,
          className: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
        };
      case 'Payment Problems':
        return {
          label: 'Payment Problems',
          icon: CreditCard,
          className: 'bg-rose-50 text-rose-700 border border-rose-200',
        };
      case 'Technical Support':
        return {
          label: 'Technical Support',
          icon: Wrench,
          className: 'bg-amber-50 text-amber-700 border border-amber-200',
        };
      case 'Feature Request':
        return {
          label: 'Feature Request',
          icon: Lightbulb,
          className: 'bg-lime-50 text-lime-700 border border-lime-200',
        };
      case 'Bug Report':
        return {
          label: 'Bug Report',
          icon: Bug,
          className: 'bg-red-50 text-red-700 border border-red-200',
        };
      case 'Other':
        return {
          label: 'Other',
          icon: HelpCircle,
          className: 'bg-gray-50 text-gray-700 border border-gray-200',
        };
      default:
        return {
          label: category,
          icon: HelpCircle,
          className: 'bg-gray-100 text-gray-800',
        };
    }
  };

  const config = getCategoryConfig();
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

