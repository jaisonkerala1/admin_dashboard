import type {
  Availability,
  AvailabilityApiResponse,
  AstrologerAvailabilitySummary,
  BreakTime,
  Holiday,
  HolidayRecurringPattern,
} from '@/types/availability';

type CreateAvailabilityInput = Omit<Availability, '_id' | 'createdAt' | 'updatedAt'>;
type UpdateAvailabilityInput = Partial<Omit<Availability, '_id' | 'createdAt' | 'updatedAt'>> & { _id: string };

type CreateHolidayInput = Omit<Holiday, '_id' | 'createdAt'>;

const pad2 = (n: number) => n.toString().padStart(2, '0');
const toYmd = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const fromYmd = (ymd: string) => new Date(`${ymd}T00:00:00.000Z`);

const isoNow = () => new Date().toISOString();

const addDays = (d: Date, days: number) => {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
};

const timeToMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

const minutesToTime = (mins: number) => `${pad2(Math.floor(mins / 60))}:${pad2(mins % 60)}`;

const makeId = (prefix: string) => `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;

const sample = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const makeBreaks = (startTime: string, endTime: string): BreakTime[] => {
  // 50% chance of one break
  if (Math.random() < 0.5) return [];

  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  if (end - start < 180) return [];

  const breakStart = randomInt(start + 60, end - 120);
  const breakEnd = breakStart + randomInt(15, 45);

  return [
    {
      startTime: minutesToTime(breakStart),
      endTime: minutesToTime(Math.min(breakEnd, end - 15)),
      reason: sample(['Lunch', 'Break', 'Temple', 'Personal']),
    },
  ];
};

const astrologersSeed = [
  { id: 'a1', name: 'Aarav Sharma', isOnline: true },
  { id: 'a2', name: 'Ananya Verma', isOnline: false },
  { id: 'a3', name: 'Rohan Mehta', isOnline: true },
  { id: 'a4', name: 'Isha Kapoor', isOnline: false },
  { id: 'a5', name: 'Vikram Singh', isOnline: true },
  { id: 'a6', name: 'Meera Nair', isOnline: true },
  { id: 'a7', name: 'Kunal Joshi', isOnline: false },
  { id: 'a8', name: 'Priya Iyer', isOnline: true },
  { id: 'a9', name: 'Siddharth Rao', isOnline: false },
  { id: 'a10', name: 'Neha Gupta', isOnline: true },
  { id: 'a11', name: 'Kabir Das', isOnline: false },
  { id: 'a12', name: 'Pooja Malhotra', isOnline: true },
];

const generateWeeklyAvailability = (astrologerId: string, astrologerName: string): Availability[] => {
  const now = new Date();
  const createdAt = isoNow();

  // 5-6 active days per week
  const activeDays = new Set<number>();
  while (activeDays.size < randomInt(5, 6)) activeDays.add(randomInt(0, 6));

  return Array.from({ length: 7 }).map((_, dayOfWeek) => {
    const isActive = activeDays.has(dayOfWeek);

    const startBase = sample([9, 10, 11, 12]);
    const endBase = sample([18, 19, 20, 21]);
    const startTime = `${pad2(startBase)}:${sample(['00', '30'])}`;
    const endTime = `${pad2(endBase)}:${sample(['00', '30'])}`;

    return {
      _id: makeId('avail'),
      astrologerId,
      astrologerName,
      dayOfWeek,
      startTime,
      endTime,
      isActive,
      breaks: isActive ? makeBreaks(startTime, endTime) : [],
      createdAt,
      updatedAt: createdAt,
    };
  });
};

const generateHolidays = (astrologerId: string, astrologerName: string): Holiday[] => {
  const today = new Date();
  const holidays: Holiday[] = [];
  const count = randomInt(0, 2);

  for (let i = 0; i < count; i++) {
    const date = addDays(today, randomInt(0, 14)); // next 2 weeks
    const isRecurring = Math.random() < 0.2;
    const recurringPattern: HolidayRecurringPattern | undefined = isRecurring ? sample(['yearly', 'monthly', 'weekly']) : undefined;

    holidays.push({
      _id: makeId('hol'),
      astrologerId,
      astrologerName,
      date: date.toISOString(),
      reason: sample(['Festival', 'Travel', 'Personal', 'Health', 'Family function']),
      isRecurring,
      recurringPattern,
      createdAt: isoNow(),
    });
  }

  return holidays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

const isHolidayOnDate = (holiday: Holiday, ymd: string) => {
  const holidayYmd = toYmd(new Date(holiday.date));
  if (!holiday.isRecurring) return holidayYmd === ymd;

  const target = fromYmd(ymd);
  const holidayDate = new Date(holiday.date);
  const pattern = holiday.recurringPattern;

  if (pattern === 'yearly') return holidayDate.getMonth() === target.getMonth() && holidayDate.getDate() === target.getDate();
  if (pattern === 'monthly') return holidayDate.getDate() === target.getDate();
  if (pattern === 'weekly') return holidayDate.getDay() === target.getDay();

  return holidayYmd === ymd;
};

const toSlotsLabel = (availability: Availability): string[] => {
  if (!availability.isActive) return [];

  const ranges: Array<{ start: string; end: string }> = [{ start: availability.startTime, end: availability.endTime }];

  // remove breaks from the main range (simple approach: split around first break)
  if (availability.breaks.length > 0) {
    const b = availability.breaks[0];
    const main = ranges[0];
    const a = { start: main.start, end: b.startTime };
    const c = { start: b.endTime, end: main.end };
    const out = [a, c].filter((r) => timeToMinutes(r.end) - timeToMinutes(r.start) >= 30);
    return out.map((r) => `${r.start}-${r.end}`);
  }

  return ranges.map((r) => `${r.start}-${r.end}`);
};

// ---- In-memory mock DB (module singleton) ----
const db = (() => {
  const availabilityByAstrologer = new Map<string, Availability[]>();
  const holidaysByAstrologer = new Map<string, Holiday[]>();

  for (const a of astrologersSeed) {
    availabilityByAstrologer.set(a.id, generateWeeklyAvailability(a.id, a.name));
    holidaysByAstrologer.set(a.id, generateHolidays(a.id, a.name));
  }

  return { availabilityByAstrologer, holidaysByAstrologer };
})();

const delay = async (ms: number) => new Promise((r) => setTimeout(r, ms));

export const availabilityApi = {
  async getAllAstrologersAvailability(dateYmd?: string): Promise<AvailabilityApiResponse<AstrologerAvailabilitySummary[]>> {
    await delay(250);

    const now = new Date();
    const ymd = dateYmd || toYmd(now);
    const dayOfWeek = fromYmd(ymd).getDay();

    const summaries: AstrologerAvailabilitySummary[] = astrologersSeed.map((a) => {
      const weeklyAvailability = db.availabilityByAstrologer.get(a.id) || [];
      const holidays = db.holidaysByAstrologer.get(a.id) || [];
      const upcomingHolidays = holidays.filter((h) => {
        const hd = new Date(h.date);
        const diffDays = (hd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 7;
      });

      const isHolidayToday = holidays.some((h) => isHolidayOnDate(h, ymd));
      const todaysRule = weeklyAvailability.find((w) => w.dayOfWeek === dayOfWeek);
      const todaySlots = !isHolidayToday && todaysRule ? toSlotsLabel(todaysRule) : [];
      const todayAvailable = a.isOnline && todaySlots.length > 0;

      return {
        astrologerId: a.id,
        astrologerName: a.name,
        isOnline: a.isOnline,
        todayAvailable,
        todaySlots,
        upcomingHolidays,
        weeklyAvailability,
      };
    });

    return { success: true, data: summaries };
  },

  async getAstrologerAvailability(astrologerId: string): Promise<AvailabilityApiResponse<Availability[]>> {
    await delay(200);
    const data = db.availabilityByAstrologer.get(astrologerId) || [];
    return { success: true, data };
  },

  async createAvailability(input: CreateAvailabilityInput): Promise<AvailabilityApiResponse<Availability>> {
    await delay(250);
    const list = db.availabilityByAstrologer.get(input.astrologerId) || [];
    const createdAt = isoNow();

    const item: Availability = {
      ...input,
      _id: makeId('avail'),
      createdAt,
      updatedAt: createdAt,
    };

    db.availabilityByAstrologer.set(input.astrologerId, [...list, item]);
    return { success: true, data: item };
  },

  async updateAvailability(input: UpdateAvailabilityInput): Promise<AvailabilityApiResponse<Availability>> {
    await delay(250);
    for (const [astrologerId, list] of db.availabilityByAstrologer.entries()) {
      const idx = list.findIndex((x) => x._id === input._id);
      if (idx >= 0) {
        const updated: Availability = {
          ...list[idx],
          ...input,
          updatedAt: isoNow(),
        };
        const newList = [...list];
        newList[idx] = updated;
        db.availabilityByAstrologer.set(astrologerId, newList);
        return { success: true, data: updated };
      }
    }
    return { success: false, error: 'Availability not found' };
  },

  async deleteAvailability(id: string): Promise<AvailabilityApiResponse<{ id: string }>> {
    await delay(200);
    for (const [astrologerId, list] of db.availabilityByAstrologer.entries()) {
      const newList = list.filter((x) => x._id !== id);
      if (newList.length !== list.length) {
        db.availabilityByAstrologer.set(astrologerId, newList);
        return { success: true, data: { id } };
      }
    }
    return { success: false, error: 'Availability not found' };
  },

  async getAllHolidays(): Promise<AvailabilityApiResponse<Holiday[]>> {
    await delay(200);
    const all: Holiday[] = [];
    for (const list of db.holidaysByAstrologer.values()) all.push(...list);
    all.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return { success: true, data: all };
  },

  async getAstrologerHolidays(astrologerId: string): Promise<AvailabilityApiResponse<Holiday[]>> {
    await delay(200);
    const data = db.holidaysByAstrologer.get(astrologerId) || [];
    return { success: true, data };
  },

  async createHoliday(input: CreateHolidayInput): Promise<AvailabilityApiResponse<Holiday>> {
    await delay(250);
    const list = db.holidaysByAstrologer.get(input.astrologerId) || [];
    const item: Holiday = {
      ...input,
      _id: makeId('hol'),
      createdAt: isoNow(),
    };
    db.holidaysByAstrologer.set(input.astrologerId, [...list, item].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    return { success: true, data: item };
  },

  async deleteHoliday(id: string): Promise<AvailabilityApiResponse<{ id: string }>> {
    await delay(200);
    for (const [astrologerId, list] of db.holidaysByAstrologer.entries()) {
      const newList = list.filter((x) => x._id !== id);
      if (newList.length !== list.length) {
        db.holidaysByAstrologer.set(astrologerId, newList);
        return { success: true, data: { id } };
      }
    }
    return { success: false, error: 'Holiday not found' };
  },
};


