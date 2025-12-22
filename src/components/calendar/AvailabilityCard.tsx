import React from 'react';
import { Clock, Settings } from 'lucide-react';
import type { AstrologerAvailabilitySummary } from '@/types';
import { RoundAvatar } from '@/components/common';
import { AvailabilityStatusBadge, type AvailabilityStatus } from './AvailabilityStatusBadge';
import { HolidayBadge } from './HolidayBadge';

function statusFor(summary: AstrologerAvailabilitySummary, isHoliday: boolean): AvailabilityStatus {
  if (isHoliday) return 'holiday';
  if (!summary.isOnline) return 'offline';
  if (summary.todaySlots.length === 0) return 'unavailable';
  return summary.todayAvailable ? 'available' : 'unavailable';
}

export const AvailabilityCard: React.FC<{
  summary: AstrologerAvailabilitySummary;
  isHoliday?: boolean;
  onManage: (astrologerId: string) => void;
}> = ({ summary, isHoliday = false, onManage }) => {
  const status = statusFor(summary, isHoliday);

  return (
    <div className="p-4 rounded-xl border border-gray-200 bg-white hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <RoundAvatar name={summary.astrologerName} src={summary.profilePicture} isOnline={summary.isOnline} size="md" />
          <div>
            <div className="flex items-center gap-2">
              <div className="font-semibold text-gray-900">{summary.astrologerName}</div>
              <AvailabilityStatusBadge status={status} />
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              {isHoliday
                ? 'Holiday (no slots)'
                : summary.todaySlots.length > 0
                  ? summary.todaySlots.join(', ')
                  : 'No slots for selected date'}
            </div>
            {summary.upcomingHolidays.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {summary.upcomingHolidays.slice(0, 2).map((h) => (
                  <HolidayBadge key={h._id} holiday={h} />
                ))}
                {summary.upcomingHolidays.length > 2 && (
                  <span className="text-xs text-gray-500">+{summary.upcomingHolidays.length - 2} more</span>
                )}
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onManage(summary.astrologerId)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-50 hover:bg-gray-100 border border-gray-200"
        >
          <Settings className="w-4 h-4" />
          Manage
        </button>
      </div>
    </div>
  );
};


