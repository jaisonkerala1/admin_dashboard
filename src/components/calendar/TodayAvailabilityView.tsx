import React, { useMemo } from 'react';
import type { AstrologerAvailabilitySummary } from '@/types';
import { AvailabilityCard } from './AvailabilityCard';

export const TodayAvailabilityView: React.FC<{
  summaries: AstrologerAvailabilitySummary[];
  searchTerm: string;
  showOnlyAvailable: boolean;
  holidayAstrologerIds?: Set<string>;
  onManageAstrologer: (astrologerId: string) => void;
}> = ({ summaries, searchTerm, showOnlyAvailable, holidayAstrologerIds, onManageAstrologer }) => {
  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return summaries
      .filter((s) => (q ? s.astrologerName.toLowerCase().includes(q) : true))
      .filter((s) => (showOnlyAvailable ? s.todayAvailable : true));
  }, [summaries, searchTerm, showOnlyAvailable]);

  if (filtered.length === 0) {
    return (
      <div className="p-10 text-center text-gray-500 dark:text-muted-foreground">
        No astrologers match the current filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {filtered.map((s) => (
        <AvailabilityCard
          key={s.astrologerId}
          summary={s}
          isHoliday={holidayAstrologerIds?.has(s.astrologerId) || false}
          onManage={onManageAstrologer}
        />
      ))}
    </div>
  );
};


