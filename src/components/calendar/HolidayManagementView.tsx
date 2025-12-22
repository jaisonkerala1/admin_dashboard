import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { AstrologerAvailabilitySummary, Holiday, HolidayRecurringPattern } from '@/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  createHolidayRequest,
  deleteHolidayRequest,
  fetchAllHolidaysRequest,
  fetchAstrologerAvailabilityRequest,
  setSelectedAstrologer,
} from '@/store/slices/availabilitySlice';
import { HolidayBadge } from './HolidayBadge';

type Draft = {
  astrologerId: string;
  astrologerName?: string;
  date: string; // YYYY-MM-DD
  reason: string;
  isRecurring: boolean;
  recurringPattern?: HolidayRecurringPattern;
};

const todayYmd = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const HolidayManagementView: React.FC<{
  summaries: AstrologerAvailabilitySummary[];
  selectedAstrologerId: string | null;
  allHolidays: Holiday[];
}> = ({ summaries, selectedAstrologerId, allHolidays }) => {
  const dispatch = useAppDispatch();
  const { isSaving } = useAppSelector((s) => s.availability);

  const [draft, setDraft] = useState<Draft>({
    astrologerId: selectedAstrologerId || '',
    date: todayYmd(),
    reason: 'Holiday',
    isRecurring: false,
  });

  useEffect(() => {
    dispatch(fetchAllHolidaysRequest());
  }, [dispatch]);

  useEffect(() => {
    // Keep draft astrologer in sync if admin selects one
    if (selectedAstrologerId) {
      const selected = summaries.find((s) => s.astrologerId === selectedAstrologerId);
      setDraft((d) => ({ ...d, astrologerId: selectedAstrologerId, astrologerName: selected?.astrologerName }));
    }
  }, [selectedAstrologerId, summaries]);

  const filtered = useMemo(() => {
    if (!selectedAstrologerId) return allHolidays;
    return allHolidays.filter((h) => h.astrologerId === selectedAstrologerId);
  }, [allHolidays, selectedAstrologerId]);

  const astrologerNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of summaries) map.set(s.astrologerId, s.astrologerName);
    return map;
  }, [summaries]);

  const save = () => {
    if (!draft.astrologerId) return;
    dispatch(
      createHolidayRequest({
        astrologerId: draft.astrologerId,
        astrologerName: draft.astrologerName,
        date: new Date(`${draft.date}T00:00:00.000Z`).toISOString(),
        reason: draft.reason,
        isRecurring: draft.isRecurring,
        recurringPattern: draft.isRecurring ? draft.recurringPattern : undefined,
      })
    );
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-end lg:justify-between">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Astrologer</label>
              <select
                value={selectedAstrologerId || ''}
                onChange={(e) => {
                  const id = e.target.value || null;
                  dispatch(setSelectedAstrologer(id));
                  if (id) dispatch(fetchAstrologerAvailabilityRequest({ astrologerId: id }));
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white"
              >
                <option value="">All astrologers</option>
                {summaries.map((s) => (
                  <option key={s.astrologerId} value={s.astrologerId}>
                    {s.astrologerName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={draft.date}
                disabled={isSaving}
                onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <input
                type="text"
                value={draft.reason}
                disabled={isSaving}
                onChange={(e) => setDraft({ ...draft, reason: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={draft.isRecurring}
                disabled={isSaving}
                onChange={(e) => setDraft({ ...draft, isRecurring: e.target.checked })}
              />
              Recurring
            </label>
            {draft.isRecurring && (
              <select
                value={draft.recurringPattern || 'yearly'}
                disabled={isSaving}
                onChange={(e) => setDraft({ ...draft, recurringPattern: e.target.value as HolidayRecurringPattern })}
                className="px-3 py-2 border border-gray-200 rounded-lg bg-white"
              >
                <option value="yearly">Yearly</option>
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
              </select>
            )}
            <button
              type="button"
              onClick={save}
              disabled={isSaving || !draft.astrologerId}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Add holiday
            </button>
          </div>
        </div>

        {!draft.astrologerId && (
          <div className="text-xs text-gray-500 mt-2">
            Tip: pick an astrologer from the dropdown to add a holiday for them.
          </div>
        )}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No holidays found.</div>
        ) : (
          filtered.map((h) => (
            <div key={h._id} className="p-4 rounded-xl border border-gray-200 bg-white flex items-center justify-between gap-3">
              <div className="flex flex-col gap-1">
                <div className="font-semibold text-gray-900">
                  {h.astrologerName || astrologerNameById.get(h.astrologerId) || h.astrologerId}
                </div>
                <div className="flex flex-wrap gap-2">
                  <HolidayBadge holiday={h} />
                  {h.isRecurring && (
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                      Recurring: {h.recurringPattern || 'yearly'}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => dispatch(deleteHolidayRequest({ id: h._id }))}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-sm font-medium text-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};


