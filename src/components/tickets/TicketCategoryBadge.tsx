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
          className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
        };
      case 'Calendar Problems':
        return {
          label: 'Calendar Problems',
          icon: Calendar,
          className: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
        };
      case 'Consultation Issues':
        return {
          label: 'Consultation Issues',
          icon: MessageSquare,
          className: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
        };
      case 'Payment Problems':
        return {
          label: 'Payment Problems',
          icon: CreditCard,
          className: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
        };
      case 'Technical Support':
        return {
          label: 'Technical Support',
          icon: Wrench,
          className: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
        };
      case 'Feature Request':
        return {
          label: 'Feature Request',
          icon: Lightbulb,
          className: 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200',
        };
      case 'Bug Report':
        return {
          label: 'Bug Report',
          icon: Bug,
          className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        };
      case 'Other':
        return {
          label: 'Other',
          icon: HelpCircle,
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
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
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md ${config.className}`}
    >
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      {config.label}
    </span>
  );
};

