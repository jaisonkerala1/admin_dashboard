import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PoojaRequest } from '@/types';

export type ServiceRequestFilter = 'all' | 'pending' | 'confirmed' | 'inProgress' | 'completed' | 'cancelled';

export interface ServiceRequestsStats {
  total: number;
  pending: number;
  confirmed: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
}

interface PoojaRequestsState {
  requests: PoojaRequest[];
  isLoading: boolean;
  error: string | null;
  filter: ServiceRequestFilter;
  search: string;
  entriesPerPage: number;
  currentPage: number;
  selectedIds: Set<string>;
  stats: ServiceRequestsStats;
}

const initialState: PoojaRequestsState = {
  requests: [],
  isLoading: false,
  error: null,
  filter: 'all',
  search: '',
  entriesPerPage: 8,
  currentPage: 1,
  selectedIds: new Set(),
  stats: {
    total: 0,
    pending: 0,
    confirmed: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0,
  },
};

const poojaRequestsSlice = createSlice({
  name: 'poojaRequests',
  initialState,
  reducers: {
    // Fetch requests
    fetchRequestsRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchRequestsSuccess: (state, action: PayloadAction<{ requests: PoojaRequest[]; stats: ServiceRequestsStats }>) => {
      state.requests = action.payload.requests;
      state.stats = action.payload.stats;
      state.isLoading = false;
      state.error = null;
    },
    fetchRequestsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    // Filters and search
    setFilter: (state, action: PayloadAction<ServiceRequestFilter>) => {
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
    
    // Update request
    updateRequestRequest: (state, _action: PayloadAction<{ id: string; data: any }>) => {
      state.isLoading = true;
      state.error = null;
    },
    updateRequestSuccess: (state, action: PayloadAction<PoojaRequest>) => {
      const index = state.requests.findIndex(r => r._id === action.payload._id);
      if (index !== -1) {
        state.requests[index] = action.payload;
      }
      state.isLoading = false;
      state.error = null;
    },
    updateRequestFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    // Delete request (optimistic update)
    deleteRequestOptimistic: (state, action: PayloadAction<string>) => {
      state.requests = state.requests.filter(r => r._id !== action.payload);
      state.selectedIds = new Set(Array.from(state.selectedIds).filter(id => id !== action.payload));
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchRequestsRequest,
  fetchRequestsSuccess,
  fetchRequestsFailure,
  setFilter,
  setSearch,
  setEntriesPerPage,
  setCurrentPage,
  setSelectedIds,
  selectAll,
  deselectAll,
  toggleSelection,
  updateRequestRequest,
  updateRequestSuccess,
  updateRequestFailure,
  deleteRequestOptimistic,
  clearError,
} = poojaRequestsSlice.actions;

export default poojaRequestsSlice.reducer;





