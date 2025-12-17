import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Service } from '@/types';

export type ServiceFilter = 'all' | 'active' | 'inactive';

export interface ServicesStats {
  total: number;
  active: number;
  inactive: number;
  totalBookings: number;
  completedBookings: number;
  totalRevenue: number;
  averageRating: number;
}

export interface ServicesState {
  services: Service[];
  isLoading: boolean;
  error: string | null;
  filter: ServiceFilter;
  search: string;
  entriesPerPage: number;
  currentPage: number;
  selectedIds: Set<string>;
  stats: ServicesStats;
}

const initialState: ServicesState = {
  services: [],
  isLoading: false,
  error: null,
  filter: 'all',
  search: '',
  entriesPerPage: 8,
  currentPage: 1,
  selectedIds: new Set(),
  stats: {
    total: 0,
    active: 0,
    inactive: 0,
    totalBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    averageRating: 0,
  },
};

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    // Fetch services
    fetchServicesRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchServicesSuccess: (state, action: PayloadAction<{ services: Service[]; stats: ServicesStats }>) => {
      state.isLoading = false;
      state.services = action.payload.services;
      state.stats = action.payload.stats;
      state.error = null;
    },
    fetchServicesFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Filters and search
    setFilter: (state, action: PayloadAction<ServiceFilter>) => {
      state.filter = action.payload;
      state.currentPage = 1;
      state.selectedIds = new Set();
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

    // Delete service (optimistic update)
    deleteServiceOptimistic: (state, action: PayloadAction<string>) => {
      state.services = state.services.filter(s => s._id !== action.payload);
      state.selectedIds = new Set(Array.from(state.selectedIds).filter(id => id !== action.payload));
    },
  },
});

export const {
  fetchServicesRequest,
  fetchServicesSuccess,
  fetchServicesFailure,
  setFilter,
  setSearch,
  setEntriesPerPage,
  setCurrentPage,
  setSelectedIds,
  selectAll,
  deselectAll,
  toggleSelection,
  deleteServiceOptimistic,
} = servicesSlice.actions;

export default servicesSlice.reducer;


