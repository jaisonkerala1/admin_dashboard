import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  ApprovalRequest,
  ApprovalStats,
  ApprovalFilters,
  ApprovalPagination,
} from '@/types/approval';

interface ApprovalState {
  requests: ApprovalRequest[];
  currentRequest: ApprovalRequest | null;
  stats: ApprovalStats | null;
  filters: ApprovalFilters;
  pagination: ApprovalPagination;
  isLoading: boolean;
  isLoadingStats: boolean;
  isLoadingDetail: boolean;
  isProcessing: boolean;
  error: string | null;
}

const initialState: ApprovalState = {
  requests: [],
  currentRequest: null,
  stats: null,
  filters: {
    type: 'all',
    status: 'all',
    search: '',
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },
  isLoading: false,
  isLoadingStats: false,
  isLoadingDetail: false,
  isProcessing: false,
  error: null,
};

const approvalSlice = createSlice({
  name: 'approval',
  initialState,
  reducers: {
    // Fetch Requests
    fetchRequestsRequest: (
      state,
      _action: PayloadAction<{
        filters?: Partial<ApprovalFilters>;
        page?: number;
        limit?: number;
      }>
    ) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchRequestsSuccess: (
      state,
      action: PayloadAction<{
        requests: ApprovalRequest[];
        pagination: ApprovalPagination;
      }>
    ) => {
      state.isLoading = false;
      state.requests = action.payload.requests;
      state.pagination = action.payload.pagination;
      state.error = null;
    },
    fetchRequestsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Fetch Stats
    fetchStatsRequest: (state) => {
      state.isLoadingStats = true;
      state.error = null;
    },
    fetchStatsSuccess: (state, action: PayloadAction<ApprovalStats>) => {
      state.isLoadingStats = false;
      state.stats = action.payload;
      state.error = null;
    },
    fetchStatsFailure: (state, action: PayloadAction<string>) => {
      state.isLoadingStats = false;
      state.error = action.payload;
    },

    // Fetch Request Detail
    fetchRequestDetailRequest: (state, _action: PayloadAction<string>) => {
      state.isLoadingDetail = true;
      state.error = null;
    },
    fetchRequestDetailSuccess: (state, action: PayloadAction<ApprovalRequest>) => {
      state.isLoadingDetail = false;
      state.currentRequest = action.payload;
      state.error = null;
    },
    fetchRequestDetailFailure: (state, action: PayloadAction<string>) => {
      state.isLoadingDetail = false;
      state.error = action.payload;
    },

    // Approve Request
    approveRequestRequest: (state, _action: PayloadAction<{ requestId: string; notes?: string }>) => {
      state.isProcessing = true;
      state.error = null;
    },
    approveRequestSuccess: (state, action: PayloadAction<ApprovalRequest>) => {
      state.isProcessing = false;
      const index = state.requests.findIndex((r) => r._id === action.payload._id);
      if (index !== -1) {
        state.requests[index] = action.payload;
      }
      if (state.currentRequest?._id === action.payload._id) {
        state.currentRequest = action.payload;
      }
      state.error = null;
    },
    approveRequestFailure: (state, action: PayloadAction<string>) => {
      state.isProcessing = false;
      state.error = action.payload;
    },

    // Reject Request
    rejectRequestRequest: (state, _action: PayloadAction<{ requestId: string; rejectionReason: string }>) => {
      state.isProcessing = true;
      state.error = null;
    },
    rejectRequestSuccess: (state, action: PayloadAction<ApprovalRequest>) => {
      state.isProcessing = false;
      const index = state.requests.findIndex((r) => r._id === action.payload._id);
      if (index !== -1) {
        state.requests[index] = action.payload;
      }
      if (state.currentRequest?._id === action.payload._id) {
        state.currentRequest = action.payload;
      }
      state.error = null;
    },
    rejectRequestFailure: (state, action: PayloadAction<string>) => {
      state.isProcessing = false;
      state.error = action.payload;
    },

    // Set Filters
    setFilters: (state, action: PayloadAction<Partial<ApprovalFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page when filters change
    },

    // Set Page
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },

    // Clear Current Request
    clearCurrentRequest: (state) => {
      state.currentRequest = null;
    },
  },
});

export const {
  fetchRequestsRequest,
  fetchRequestsSuccess,
  fetchRequestsFailure,
  fetchStatsRequest,
  fetchStatsSuccess,
  fetchStatsFailure,
  fetchRequestDetailRequest,
  fetchRequestDetailSuccess,
  fetchRequestDetailFailure,
  approveRequestRequest,
  approveRequestSuccess,
  approveRequestFailure,
  rejectRequestRequest,
  rejectRequestSuccess,
  rejectRequestFailure,
  setFilters,
  setPage,
  clearCurrentRequest,
} = approvalSlice.actions;

export default approvalSlice.reducer;

