export interface BreakTime {
  startTime: string; // "14:00"
  endTime: string; // "15:00"
  reason: string;
}

export interface Availability {
  _id: string;
  astrologerId: string;
  astrologerName?: string;
  dayOfWeek: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  startTime: string; // "09:00"
  endTime: string; // "18:00"
  isActive: boolean;
  breaks: BreakTime[];
  createdAt: string;
  updatedAt: string;
}

export type HolidayRecurringPattern = 'yearly' | 'monthly' | 'weekly';

export interface Holiday {
  _id: string;
  astrologerId: string;
  astrologerName?: string;
  date: string; // ISO datetime
  reason: string;
  isRecurring: boolean;
  recurringPattern?: HolidayRecurringPattern;
  createdAt: string;
}

export interface AstrologerAvailabilitySummary {
  astrologerId: string;
  astrologerName: string;
  profilePicture?: string;
  isOnline: boolean;
  todayAvailable: boolean;
  todaySlots: string[]; // ["09:00-12:00", "14:00-18:00"]
  upcomingHolidays: Holiday[];
  weeklyAvailability: Availability[];
}

export interface AvailabilityFilters {
  date: string; // YYYY-MM-DD
  showOnlyAvailable: boolean;
  searchTerm: string;
}

export interface AvailabilityApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}


