import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { SupportTicket } from '@/types/ticket';
import { TicketStatusBadge } from './TicketStatusBadge';
import { TicketPriorityBadge } from './TicketPriorityBadge';
import { TicketCategoryBadge } from './TicketCategoryBadge';
import { User, MessageSquare, Clock } from 'lucide-react';

interface TicketCardProps {
  ticket: SupportTicket;
  onClick?: () => void;
  isSelected?: boolean;
  onSelect?: (ticketId: string) => void;
  showCheckbox?: boolean;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  onClick,
  isSelected = false,
  onSelect,
  showCheckbox = false,
}) => {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(ticket.id);
    }
  };

  return (
    <div
      className={`cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-blue-500 rounded-2xl' : ''
      }`}
      onClick={onClick}
    >
      <div
        className={`bg-white dark:bg-card rounded-2xl p-5 border border-gray-100 dark:border-border shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-200 dark:hover:border-border/80 hover:-translate-y-0.5 ${
          isSelected ? 'ring-2 ring-blue-500 dark:ring-primary-500' : ''
        }`}
      >
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          {showCheckbox && (
            <div className="flex items-center pt-0.5">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={handleCheckboxChange}
                className="w-4 h-4 text-blue-600 border-gray-300 dark:border-border rounded focus:ring-blue-500 focus:ring-2"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-mono text-gray-500 dark:text-muted-foreground">
                    {ticket.ticketNumber}
                  </span>
                  <TicketPriorityBadge priority={ticket.priority} showIcon={false} />
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-foreground truncate mb-1">
                  {ticket.title}
                </h3>
              </div>
              <TicketStatusBadge status={ticket.status} />
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-muted-foreground line-clamp-2 mb-3">
              {ticket.description}
            </p>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-muted-foreground">
              <TicketCategoryBadge category={ticket.category} />
              
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>{ticket.userName}</span>
              </div>

              {ticket.messagesCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{ticket.messagesCount} messages</span>
                </div>
              )}

              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</span>
              </div>
            </div>

            {/* Assigned To */}
            {ticket.assignedToName && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-border">
                <span className="text-xs text-gray-500 dark:text-muted-foreground">
                  Assigned to:{' '}
                  <span className="font-medium text-gray-700 dark:text-foreground">
                    {ticket.assignedToName}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

