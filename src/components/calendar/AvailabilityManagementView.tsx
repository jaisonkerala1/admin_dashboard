import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import type { Availability, AstrologerAvailabilitySummary, BreakTime } from '@/types';
import { Modal } from '@/components/common';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  createAvailabilityRequest,
  deleteAvailabilityRequest,
  fetchAstrologerAvailabilityRequest,
  setSelectedAstrologer,
  updateAvailabilityRequest,
} from '@/store/slices/availabilitySlice';
import { TimeSlotPicker } from './TimeSlotPicker';
import { WeekDaySelector } from './WeekDaySelector';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type Draft = {
  _id?: string;
  astrologerId: string;
  astrologerName?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  breaks: BreakTime[];
};

const emptyDraft = (astrologerId: string, astrologerName?: string): Draft => ({
  astrologerId,
  astrologerName,
  dayOfWeek: 1,
  startTime: '09:00',
  endTime: '18:00',
  isActive: true,
  breaks: [],
});

export const AvailabilityManagementView: React.FC<{
  summaries: AstrologerAvailabilitySummary[];
  selectedAstrologerId: string | null;
  selectedAvailability: Availability[];
}> = ({ summaries, selectedAstrologerId, selectedAvailability }) => {
  const dispatch = useAppDispatch();
  const { isSaving } = useAppSelector((s) => s.availability);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);

  const selected = useMemo(
    () => summaries.find((s) => s.astrologerId === selectedAstrologerId) || null,
    [summaries, selectedAstrologerId]
  );

  useEffect(() => {
    if (selectedAstrologerId) {
      dispatch(fetchAstrologerAvailabilityRequest({ astrologerId: selectedAstrologerId }));
    }
  }, [dispatch, selectedAstrologerId]);

  const openCreate = () => {
    if (!selectedAstrologerId) return;
    setDraft(emptyDraft(selectedAstrologerId, selected?.astrologerName));
    setIsModalOpen(true);
  };

  const openEdit = (a: Availability) => {
    setDraft({
      _id: a._id,
      astrologerId: a.astrologerId,
      astrologerName: a.astrologerName,
      dayOfWeek: a.dayOfWeek,
      startTime: a.startTime,
      endTime: a.endTime,
      isActive: a.isActive,
      breaks: a.breaks || [],
    });
    setIsModalOpen(true);
  };

  const close = () => {
    setIsModalOpen(false);
    setDraft(null);
  };

  const save = () => {
    if (!draft) return;
    if (!draft.astrologerId) return;

    if (draft._id) {
      dispatch(
        updateAvailabilityRequest({
          _id: draft._id,
          dayOfWeek: draft.dayOfWeek,
          startTime: draft.startTime,
          endTime: draft.endTime,
          isActive: draft.isActive,
          breaks: draft.breaks,
        })
      );
    } else {
      dispatch(
        createAvailabilityRequest({
          astrologerId: draft.astrologerId,
          astrologerName: draft.astrologerName,
          dayOfWeek: draft.dayOfWeek,
          startTime: draft.startTime,
          endTime: draft.endTime,
          isActive: draft.isActive,
          breaks: draft.breaks,
        })
      );
    }
    close();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-3 lg:items-end lg:justify-between">
        <div className="max-w-xl w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-foreground mb-1">Select astrologer</label>
          <select
            value={selectedAstrologerId || ''}
            onChange={(e) => {
              const id = e.target.value || null;
              dispatch(setSelectedAstrologer(id));
              if (id) dispatch(fetchAstrologerAvailabilityRequest({ astrologerId: id }));
            }}
            className="w-full px-3 py-2 border border-gray-200 dark:border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-card text-gray-900 dark:text-foreground"
          >
            <option value="">Choose...</option>
            {summaries.map((s) => (
              <option key={s.astrologerId} value={s.astrologerId}>
                {s.astrologerName}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={openCreate}
          disabled={!selectedAstrologerId}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary-600 dark:bg-primary-700 text-white font-medium hover:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Add availability
        </button>
      </div>

      {!selectedAstrologerId ? (
        <div className="p-10 text-center text-gray-500 dark:text-muted-foreground">Select an astrologer to manage availability.</div>
      ) : (
        <div className="space-y-3">
          {selectedAvailability.length === 0 ? (
            <div className="p-10 text-center text-gray-500 dark:text-muted-foreground">No availability rules found.</div>
          ) : (
            selectedAvailability
              .slice()
              .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
              .map((a) => (
                <div key={a._id} className="p-4 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-card flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-foreground">
                      {dayNames[a.dayOfWeek] || `Day ${a.dayOfWeek}`} • {a.startTime}-{a.endTime}{' '}
                      {!a.isActive && <span className="text-xs text-gray-500 dark:text-muted-foreground">(inactive)</span>}
                    </div>
                    {a.breaks?.length > 0 && (
                      <div className="text-sm text-gray-600 dark:text-muted-foreground mt-1">
                        Breaks: {a.breaks.map((b) => `${b.startTime}-${b.endTime} (${b.reason})`).join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(a)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-muted hover:bg-gray-100 dark:hover:bg-muted/80 border border-gray-200 dark:border-border text-sm font-medium text-gray-700 dark:text-foreground"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => dispatch(deleteAvailabilityRequest({ id: a._id }))}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 text-sm font-medium text-red-700 dark:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={close} title={draft?._id ? 'Edit Availability' : 'Add Availability'} size="lg">
        {draft && (
          <div className="space-y-4">
            <WeekDaySelector
              value={draft.dayOfWeek}
              onChange={(dayOfWeek) => setDraft({ ...draft, dayOfWeek })}
              disabled={isSaving}
            />

            <TimeSlotPicker
              startTime={draft.startTime}
              endTime={draft.endTime}
              disabled={isSaving}
              onChange={({ startTime, endTime }) => setDraft({ ...draft, startTime, endTime })}
            />

            <div className="flex items-center gap-2">
              <input
                id="isActive"
                type="checkbox"
                checked={draft.isActive}
                disabled={isSaving}
                onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
                className="w-4 h-4 border-gray-300 dark:border-border"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-foreground">
                Active
              </label>
            </div>

            <div className="border-t border-gray-100 dark:border-border pt-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-900 dark:text-foreground">Breaks</div>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() =>
                    setDraft({
                      ...draft,
                      breaks: [...draft.breaks, { startTime: '13:00', endTime: '13:30', reason: 'Break' }],
                    })
                  }
                  className="text-sm font-medium text-primary-700 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 disabled:opacity-60"
                >
                  + Add break
                </button>
              </div>

              {draft.breaks.length === 0 ? (
                <div className="text-sm text-gray-500 dark:text-muted-foreground mt-2">No breaks.</div>
              ) : (
                <div className="space-y-3 mt-3">
                  {draft.breaks.map((b, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-muted-foreground mb-1">Start</label>
                        <input
                          type="time"
                          value={b.startTime}
                          disabled={isSaving}
                          onChange={(e) => {
                            const breaks = [...draft.breaks];
                            breaks[idx] = { ...breaks[idx], startTime: e.target.value };
                            setDraft({ ...draft, breaks });
                          }}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-border rounded-lg bg-white dark:bg-card text-gray-900 dark:text-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-muted-foreground mb-1">End</label>
                        <input
                          type="time"
                          value={b.endTime}
                          disabled={isSaving}
                          onChange={(e) => {
                            const breaks = [...draft.breaks];
                            breaks[idx] = { ...breaks[idx], endTime: e.target.value };
                            setDraft({ ...draft, breaks });
                          }}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-border rounded-lg bg-white dark:bg-card text-gray-900 dark:text-foreground"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 dark:text-muted-foreground mb-1">Reason</label>
                        <input
                          type="text"
                          value={b.reason}
                          disabled={isSaving}
                          onChange={(e) => {
                            const breaks = [...draft.breaks];
                            breaks[idx] = { ...breaks[idx], reason: e.target.value };
                            setDraft({ ...draft, breaks });
                          }}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-border rounded-lg bg-white dark:bg-card text-gray-900 dark:text-foreground"
                        />
                      </div>
                      <div className="md:col-span-4">
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => {
                            const breaks = draft.breaks.filter((_, i) => i !== idx);
                            setDraft({ ...draft, breaks });
                          }}
                          className="text-sm font-medium text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 disabled:opacity-60"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={close}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-border text-gray-700 dark:text-foreground hover:bg-gray-50 dark:hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg bg-primary-600 dark:bg-primary-700 text-white font-medium hover:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-60"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};


