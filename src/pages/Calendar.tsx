import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, AlertTriangle, CalendarDays, UserCheck, UserX, Settings, CalendarClock, ListChecks } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, Loader, StatCard, SearchBar } from '@/components/common';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchAllHolidaysRequest,
  fetchAvailabilitySummariesRequest,
  fetchAstrologerAvailabilityRequest,
  setFilters,
  setSelectedAstrologer,
} from '@/store/slices/availabilitySlice';
import { TodayAvailabilityView } from '@/components/calendar/TodayAvailabilityView';
import { WeeklyScheduleView } from '@/components/calendar/WeeklyScheduleView';
import { AvailabilityManagementView } from '@/components/calendar/AvailabilityManagementView';
import { HolidayManagementView } from '@/components/calendar/HolidayManagementView';

type TabKey = 'today' | 'weekly' | 'availability' | 'holidays';

const tabOptions: { key: TabKey; label: string; icon: any }[] = [
  { key: 'today', label: "Today's Availability", icon: CalendarClock },
  { key: 'weekly', label: 'Weekly Schedule', icon: CalendarDays },
  { key: 'availability', label: 'Manage Availability', icon: Settings },
  { key: 'holidays', label: 'Holidays', icon: ListChecks },
];

const dateKey = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const Calendar = () => {
  const dispatch = useAppDispatch();
  const {
    summaries,
    selectedAstrologerId,
    selectedAvailability,
    allHolidays,
    filters,
    isLoading,
    error,
  } = useAppSelector((s) => s.availability);

  const [tab, setTab] = useState<TabKey>('today');

  useEffect(() => {
    dispatch(fetchAvailabilitySummariesRequest({ date: filters.date }));
    dispatch(fetchAllHolidaysRequest());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchAvailabilitySummariesRequest({ date: filters.date }));
  }, [dispatch, filters.date]);

  useEffect(() => {
    if (selectedAstrologerId) {
      dispatch(fetchAstrologerAvailabilityRequest({ astrologerId: selectedAstrologerId }));
    }
  }, [dispatch, selectedAstrologerId]);

  const filteredHolidaysForDate = useMemo(() => {
    const target = filters.date;
    return allHolidays.filter((h) => dateKey(new Date(h.date)) === target);
  }, [allHolidays, filters.date]);

  const holidayIdSet = useMemo(() => new Set(filteredHolidaysForDate.map((h) => h.astrologerId)), [filteredHolidaysForDate]);

  const stats = useMemo(() => {
    const availableToday = summaries.filter((s) => s.todayAvailable).length;
    const offline = summaries.filter((s) => !s.isOnline).length;
    const onHolidayToday = new Set(filteredHolidaysForDate.map((h) => h.astrologerId)).size;

    const now = new Date(`${filters.date}T00:00:00.000Z`);
    const upcomingEnd = new Date(now);
    upcomingEnd.setDate(upcomingEnd.getDate() + 7);
    const upcomingHolidays7d = allHolidays.filter((h) => {
      const hd = new Date(h.date);
      return hd >= now && hd <= upcomingEnd;
    }).length;

    return { availableToday, offline, onHolidayToday, upcomingHolidays7d };
  }, [summaries, filteredHolidaysForDate, allHolidays, filters.date]);

  const headerAction = (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Date</label>
        <input
          type="date"
          value={filters.date}
          onChange={(e) => dispatch(setFilters({ date: e.target.value }))}
          className="px-3 py-2 border border-gray-200 rounded-lg bg-white"
        />
      </div>
      <div className="w-full sm:w-64">
        <SearchBar
          placeholder="Search astrologer..."
          value={filters.searchTerm}
          onSearch={(query) => dispatch(setFilters({ searchTerm: query }))}
          onClear={() => dispatch(setFilters({ searchTerm: '' }))}
        />
      </div>
      <label className="inline-flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={filters.showOnlyAvailable}
          onChange={(e) => dispatch(setFilters({ showOnlyAvailable: e.target.checked }))}
        />
        Show only available
      </label>
    </div>
  );

  return (
    <MainLayout>
      <PageHeader
        title="Calendar & Availability"
        subtitle="Scheduling oversight to ensure astrologers are available for end users"
        action={headerAction}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size="lg" text="Loading availability..." />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Available (selected date)" value={String(stats.availableToday)} icon={UserCheck} />
            <StatCard title="Offline" value={String(stats.offline)} icon={UserX} />
            <StatCard title="On holiday (selected date)" value={String(stats.onHolidayToday)} icon={CalendarDays} />
            <StatCard title="Upcoming holidays (7d)" value={String(stats.upcomingHolidays7d)} icon={AlertTriangle} />
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex gap-6 overflow-x-auto">
              {tabOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setTab(opt.key)}
                  className={`pb-3 px-1 border-b-2 whitespace-nowrap transition-colors inline-flex items-center gap-2 ${
                    tab === opt.key
                      ? 'border-blue-500 text-blue-600 font-semibold'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <opt.icon className="w-4 h-4" />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          {tab === 'today' && (
            <Card title="Today's Availability" subtitle="See who is available and their time slots">
              <TodayAvailabilityView
                summaries={summaries}
                searchTerm={filters.searchTerm}
                showOnlyAvailable={filters.showOnlyAvailable}
                holidayAstrologerIds={holidayIdSet}
                onManageAstrologer={(astrologerId) => {
                  dispatch(setSelectedAstrologer(astrologerId));
                  setTab('availability');
                }}
              />
            </Card>
          )}

          {tab === 'weekly' && (
            <Card title="Weekly Schedule" subtitle="7-day overview (based on each astrologer's weekly rules)">
              <WeeklyScheduleView summaries={summaries} searchTerm={filters.searchTerm} />
            </Card>
          )}

          {tab === 'availability' && (
            <Card title="Availability Management" subtitle="Add, edit, or delete weekly availability rules">
              <AvailabilityManagementView
                summaries={summaries}
                selectedAstrologerId={selectedAstrologerId}
                selectedAvailability={selectedAvailability}
              />
            </Card>
          )}

          {tab === 'holidays' && (
            <Card title="Holiday Management" subtitle="Manage holidays that block availability">
              <HolidayManagementView
                summaries={summaries}
                selectedAstrologerId={selectedAstrologerId}
                allHolidays={allHolidays}
              />
            </Card>
          )}
        </div>
      )}
    </MainLayout>
  );
};


