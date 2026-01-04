import React, { useMemo } from 'react';
import type { AstrologerAvailabilitySummary } from '@/types';
import { AvailabilityStatusBadge } from './AvailabilityStatusBadge';

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export const WeeklyScheduleView: React.FC<{
  summaries: AstrologerAvailabilitySummary[];
  searchTerm: string;
}> = ({ summaries, searchTerm }) => {
  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return summaries.filter((s) => (q ? s.astrologerName.toLowerCase().includes(q) : true));
  }, [summaries, searchTerm]);

  return (
    <div className="overflow-x-auto border border-gray-200 dark:border-border rounded-xl bg-white dark:bg-card">
      <table className="min-w-[900px] w-full text-sm">
        <thead className="bg-gray-50 dark:bg-muted">
          <tr>
            <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-foreground">Astrologer</th>
            {dayLabels.map((d) => (
              <th key={d} className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-foreground">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((s) => (
            <tr key={s.astrologerId} className="border-t border-gray-100 dark:border-border">
              <td className="px-4 py-3">
                <div className="font-semibold text-gray-900 dark:text-foreground">{s.astrologerName}</div>
                <div className="mt-1">
                  <AvailabilityStatusBadge status={s.isOnline ? 'available' : 'offline'} className="!text-[11px]" />
                </div>
              </td>
              {dayLabels.map((_, dayOfWeek) => {
                const rule = s.weeklyAvailability.find((r) => r.dayOfWeek === dayOfWeek);
                if (!rule || !rule.isActive) {
                  return (
                    <td key={dayOfWeek} className="px-4 py-3 text-gray-400 dark:text-muted-foreground">
                      —
                    </td>
                  );
                }
                return (
                  <td key={dayOfWeek} className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-foreground">{rule.startTime}-{rule.endTime}</div>
                    {rule.breaks?.length > 0 && (
                      <div className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5">
                        Break: {rule.breaks[0].startTime}-{rule.breaks[0].endTime}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-10 text-center text-gray-500 dark:text-muted-foreground">
                No astrologers match the current filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};



