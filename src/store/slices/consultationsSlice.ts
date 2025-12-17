import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Consultation } from '@/types';

export type ConsultationFilter = 'all' | 'scheduled' | 'inProgress' | 'completed' | 'cancelled' | 'noShow';

export interface ConsultationsStats {
  total: number;
  scheduled: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  noShow: number;
  totalRevenue: number;
}

export interface ConsultationsState {
  consultations: Consultation[];
  isLoading: boolean;
  error: string | null;
  filter: ConsultationFilter;
  search: string;
  entriesPerPage: number;
  currentPage: number;
  selectedIds: Set<string>;
  stats: ConsultationsStats;
}

const initialState: ConsultationsState = {
  consultations: [],
  isLoading: false,
  error: null,
  filter: 'all',
  search: '',
  entriesPerPage: 8,
  currentPage: 1,
  selectedIds: new Set(),
  stats: {
    total: 0,
    scheduled: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    noShow: 0,
    totalRevenue: 0,
  },
};

const consultationsSlice = createSlice({
  name: 'consultations',
  initialState,
  reducers: {
    // Fetch consultations
    fetchConsultationsRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchConsultationsSuccess: (state, action: PayloadAction<{ consultations: Consultation[]; stats: ConsultationsStats }>) => {
      state.isLoading = false;
      state.consultations = action.payload.consultations;
      state.stats = action.payload.stats;
      state.error = null;
    },
    fetchConsultationsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Filters and search
    setFilter: (state, action: PayloadAction<ConsultationFilter>) => {
      state.filter = action.payload;
      state.currentPage = 1; // Reset to first page
      state.selectedIds = new Set(); // Clear selections
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      state.currentPage = 1;
    },
    setEntriesPerPage: (state, action: PayloadAction<number>) => {
      state.entriesPerPage = action.payload;
      state.currentPage = 1;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },

    // Selection
    setSelectedIds: (state, action: PayloadAction<Set<string>>) => {
      state.selectedIds = action.payload;
    },
    selectAll: (state, action: PayloadAction<string[]>) => {
      state.selectedIds = new Set(action.payload);
    },
    deselectAll: (state) => {
      state.selectedIds = new Set();
    },
    toggleSelection: (state, action: PayloadAction<string>) => {
      const newSet = new Set(state.selectedIds);
      if (newSet.has(action.payload)) {
        newSet.delete(action.payload);
      } else {
        newSet.add(action.payload);
      }
      state.selectedIds = newSet;
    },

    // Delete consultation (optimistic update)
    deleteConsultationOptimistic: (state, action: PayloadAction<string>) => {
      state.consultations = state.consultations.filter(c => c._id !== action.payload);
      state.selectedIds = new Set(Array.from(state.selectedIds).filter(id => id !== action.payload));
    },
  },
});

export const {
  fetchConsultationsRequest,
  fetchConsultationsSuccess,
  fetchConsultationsFailure,
  setFilter,
  setSearch,
  setEntriesPerPage,
  setCurrentPage,
  setSelectedIds,
  selectAll,
  deselectAll,
  toggleSelection,
  deleteConsultationOptimistic,
} = consultationsSlice.actions;

export default consultationsSlice.reducer;


