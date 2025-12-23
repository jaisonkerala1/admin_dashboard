import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { ApprovalRequest } from '@/types/approval';
import { Card } from '@/components/common';
import { ApprovalStatusBadge } from './ApprovalStatusBadge';
import { ApprovalTypeBadge } from './ApprovalTypeBadge';
import { User, Star, Briefcase, FileText, ChevronRight } from 'lucide-react';

interface ApprovalRequestCardProps {
  request: ApprovalRequest;
  onClick?: () => void;
}

export const ApprovalRequestCard: React.FC<ApprovalRequestCardProps> = ({ request, onClick }) => {
  const getStatusBorderColor = () => {
    if (request.status === 'pending') return 'border-l-orange-500';
    if (request.status === 'approved') return 'border-l-green-500';
    return 'border-l-red-500';
  };

  return (
    <div className="cursor-pointer" onClick={onClick}>
      <Card className={`p-4 hover:shadow-md transition-all border-l-4 ${getStatusBorderColor()}`}>
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {request.astrologerAvatar ? (
              <img
                src={request.astrologerAvatar}
                alt={request.astrologerName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-6 h-6 text-gray-500" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 truncate">
                  {request.astrologerName}
                </h3>
                <p className="text-sm text-gray-500 truncate">{request.astrologerEmail}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <ApprovalTypeBadge type={request.requestType} size="sm" />
              <ApprovalStatusBadge status={request.status} size="sm" />
            </div>

            {/* Details */}
            <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
              <div className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                <span>{request.astrologerData.experience} yrs exp</span>
              </div>
              {request.astrologerData.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{request.astrologerData.rating.toFixed(1)}</span>
                </div>
              )}
              {request.astrologerData.consultationsCount > 0 && (
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{request.astrologerData.consultationsCount} consultations</span>
                </div>
              )}
              {request.documents && request.documents.length > 0 && (
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  <span>{request.documents.length} document{request.documents.length > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>

            {/* Submission time */}
            <div className="mt-2 text-xs text-gray-500">
              Submitted {formatDistanceToNow(new Date(request.submittedAt), { addSuffix: true })}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

