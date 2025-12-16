import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PoojaRequest } from '@/types';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface PoojaRequestsState {
  requests: PoojaRequest[];
  pagination: PaginationInfo;
  isLoading: boolean;
  error: string | null;
}

const initialState: PoojaRequestsState = {
  requests: [],
  pagination: { page: 1, limit: 20, total: 0, pages: 0 },
  isLoading: false,
  error: null,
};

const poojaRequestsSlice = createSlice({
  name: 'poojaRequests',
  initialState,
  reducers: {
    // Fetch requests
    fetchRequestsRequest: (state, _action: PayloadAction<{ page: number; search?: string; status?: string }>) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchRequestsSuccess: (state, action: PayloadAction<{ data: PoojaRequest[]; pagination: PaginationInfo }>) => {
      state.requests = action.payload.data;
      state.pagination = action.payload.pagination;
      state.isLoading = false;
      state.error = null;
    },
    fetchRequestsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
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
  updateRequestRequest,
  updateRequestSuccess,
  updateRequestFailure,
  clearError,
} = poojaRequestsSlice.actions;

export default poojaRequestsSlice.reducer;


