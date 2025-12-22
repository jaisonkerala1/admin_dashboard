import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  Availability,
  AvailabilityFilters,
  AstrologerAvailabilitySummary,
  Holiday,
} from '@/types';

interface AvailabilityState {
  summaries: AstrologerAvailabilitySummary[];
  selectedAstrologerId: string | null;
  selectedAvailability: Availability[];
  selectedHolidays: Holiday[];
  allHolidays: Holiday[];
  filters: AvailabilityFilters;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

const todayYmd = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const initialState: AvailabilityState = {
  summaries: [],
  selectedAstrologerId: null,
  selectedAvailability: [],
  selectedHolidays: [],
  allHolidays: [],
  filters: {
    date: todayYmd(),
    showOnlyAvailable: false,
    searchTerm: '',
  },
  isLoading: false,
  isSaving: false,
  error: null,
};

type FetchSummariesPayload = { date?: string };
type FetchAstrologerDetailPayload = { astrologerId: string };

type CreateAvailabilityPayload = Omit<Availability, '_id' | 'createdAt' | 'updatedAt'>;
type UpdateAvailabilityPayload = Partial<Omit<Availability, '_id' | 'createdAt' | 'updatedAt'>> & { _id: string };

type CreateHolidayPayload = Omit<Holiday, '_id' | 'createdAt'>;

const availabilitySlice = createSlice({
  name: 'availability',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<AvailabilityFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSelectedAstrologer: (state, action: PayloadAction<string | null>) => {
      state.selectedAstrologerId = action.payload;
      if (!action.payload) {
        state.selectedAvailability = [];
        state.selectedHolidays = [];
      }
    },

    // Summaries (Today/Weekly list)
    fetchAvailabilitySummariesRequest: (state, _action: PayloadAction<FetchSummariesPayload | undefined>) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchAvailabilitySummariesSuccess: (state, action: PayloadAction<AstrologerAvailabilitySummary[]>) => {
      state.isLoading = false;
      state.summaries = action.payload;
    },
    fetchAvailabilitySummariesFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Astrologer detail
    fetchAstrologerAvailabilityRequest: (state, _action: PayloadAction<FetchAstrologerDetailPayload>) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchAstrologerAvailabilitySuccess: (
      state,
      action: PayloadAction<{ availability: Availability[]; holidays: Holiday[] }>
    ) => {
      state.isLoading = false;
      state.selectedAvailability = action.payload.availability;
      state.selectedHolidays = action.payload.holidays;
    },
    fetchAstrologerAvailabilityFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Holidays (global list)
    fetchAllHolidaysRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchAllHolidaysSuccess: (state, action: PayloadAction<Holiday[]>) => {
      state.isLoading = false;
      state.allHolidays = action.payload;
    },
    fetchAllHolidaysFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Availability CRUD
    createAvailabilityRequest: (state, _action: PayloadAction<CreateAvailabilityPayload>) => {
      state.isSaving = true;
      state.error = null;
    },
    createAvailabilitySuccess: (state) => {
      state.isSaving = false;
    },
    createAvailabilityFailure: (state, action: PayloadAction<string>) => {
      state.isSaving = false;
      state.error = action.payload;
    },

    updateAvailabilityRequest: (state, _action: PayloadAction<UpdateAvailabilityPayload>) => {
      state.isSaving = true;
      state.error = null;
    },
    updateAvailabilitySuccess: (state) => {
      state.isSaving = false;
    },
    updateAvailabilityFailure: (state, action: PayloadAction<string>) => {
      state.isSaving = false;
      state.error = action.payload;
    },

    deleteAvailabilityRequest: (state, _action: PayloadAction<{ id: string }>) => {
      state.isSaving = true;
      state.error = null;
    },
    deleteAvailabilitySuccess: (state) => {
      state.isSaving = false;
    },
    deleteAvailabilityFailure: (state, action: PayloadAction<string>) => {
      state.isSaving = false;
      state.error = action.payload;
    },

    // Holiday CRUD
    createHolidayRequest: (state, _action: PayloadAction<CreateHolidayPayload>) => {
      state.isSaving = true;
      state.error = null;
    },
    createHolidaySuccess: (state) => {
      state.isSaving = false;
    },
    createHolidayFailure: (state, action: PayloadAction<string>) => {
      state.isSaving = false;
      state.error = action.payload;
    },

    deleteHolidayRequest: (state, _action: PayloadAction<{ id: string }>) => {
      state.isSaving = true;
      state.error = null;
    },
    deleteHolidaySuccess: (state) => {
      state.isSaving = false;
    },
    deleteHolidayFailure: (state, action: PayloadAction<string>) => {
      state.isSaving = false;
      state.error = action.payload;
    },
  },
});

export const {
  setFilters,
  setSelectedAstrologer,
  fetchAvailabilitySummariesRequest,
  fetchAvailabilitySummariesSuccess,
  fetchAvailabilitySummariesFailure,
  fetchAstrologerAvailabilityRequest,
  fetchAstrologerAvailabilitySuccess,
  fetchAstrologerAvailabilityFailure,
  fetchAllHolidaysRequest,
  fetchAllHolidaysSuccess,
  fetchAllHolidaysFailure,
  createAvailabilityRequest,
  createAvailabilitySuccess,
  createAvailabilityFailure,
  updateAvailabilityRequest,
  updateAvailabilitySuccess,
  updateAvailabilityFailure,
  deleteAvailabilityRequest,
  deleteAvailabilitySuccess,
  deleteAvailabilityFailure,
  createHolidayRequest,
  createHolidaySuccess,
  createHolidayFailure,
  deleteHolidayRequest,
  deleteHolidaySuccess,
  deleteHolidayFailure,
} = availabilitySlice.actions;

export default availabilitySlice.reducer;


