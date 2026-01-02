import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Boost {
  boostId: string;
  astrologerId: string;
  astrologerName: string;
  astrologerEmail: string;
  astrologerPhone: string;
  astrologerAvatar: string | null;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  durationDays: number;
  dailyCost: number;
  totalCost: number;
  status: 'pending' | 'active' | 'expired' | 'rejected' | 'cancelled' | 'cancelled_by_user' | 'cancelled_by_admin';
  isActive: boolean;
  createdAt: string;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectedBy: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  cancelledBy: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  createdByAdmin: boolean;
}

export interface BoostDetails extends Boost {
  astrologer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    profilePicture: string | null;
    specializations: string[];
    languages: string[];
    experience: number;
    ratePerMinute: number;
    bio: string;
    awards: string;
    certificates: string;
    isOnline: boolean;
    totalEarnings: number;
  } | null;
}

export interface BoostStatistics {
  totalActiveBoosts: number;
  totalPendingBoosts: number;
  averageBoostDuration: number;
  topBoostedAstrologers: Array<{
    astrologerId: string;
    name: string;
    profilePicture: string | null;
    totalBoostsCount: number;
    currentBoostStatus: string;
  }>;
}

export interface BoostFilters {
  status: 'all' | 'active' | 'pending' | 'expired' | 'rejected' | 'cancelled_by_user' | 'cancelled_by_admin';
  search: string;
}

export interface BoostPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface AdCentreState {
  boosts: Boost[];
  currentBoost: BoostDetails | null;
  statistics: BoostStatistics | null;
  filters: BoostFilters;
  pagination: BoostPagination;
  isLoading: boolean;
  isLoadingDetails: boolean;
  isLoadingStats: boolean;
  isProcessing: boolean;
  error: string | null;
}

const initialState: AdCentreState = {
  boosts: [],
  currentBoost: null,
  statistics: null,
  filters: {
    status: 'all',
    search: '',
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  isLoading: false,
  isLoadingDetails: false,
  isLoadingStats: false,
  isProcessing: false,
  error: null,
};

const adCentreSlice = createSlice({
  name: 'adCentre',
  initialState,
  reducers: {
    // Fetch Boosts
    fetchBoostsRequest: (
      state,
      _action: PayloadAction<{
        filters?: Partial<BoostFilters>;
        page?: number;
        limit?: number;
        sort?: string;
      }>
    ) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchBoostsSuccess: (
      state,
      action: PayloadAction<{
        boosts: Boost[];
        pagination: BoostPagination;
      }>
    ) => {
      state.isLoading = false;
      state.boosts = action.payload.boosts;
      state.pagination = action.payload.pagination;
      state.error = null;
    },
    fetchBoostsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Fetch Boost Details
    fetchBoostDetailsRequest: (state, _action: PayloadAction<string>) => {
      state.isLoadingDetails = true;
      state.error = null;
    },
    fetchBoostDetailsSuccess: (state, action: PayloadAction<BoostDetails>) => {
      state.isLoadingDetails = false;
      state.currentBoost = action.payload;
      state.error = null;
    },
    fetchBoostDetailsFailure: (state, action: PayloadAction<string>) => {
      state.isLoadingDetails = false;
      state.error = action.payload;
    },

    // Approve Boost
    approveBoostRequest: (state, _action: PayloadAction<string>) => {
      state.isProcessing = true;
      state.error = null;
    },
    approveBoostSuccess: (state, action: PayloadAction<Boost>) => {
      state.isProcessing = false;
      const index = state.boosts.findIndex((b) => b.boostId === action.payload.boostId);
      if (index !== -1) {
        state.boosts[index] = action.payload;
      }
      if (state.currentBoost?.boostId === action.payload.boostId) {
        state.currentBoost = { ...state.currentBoost, ...action.payload };
      }
      state.error = null;
    },
    approveBoostFailure: (state, action: PayloadAction<string>) => {
      state.isProcessing = false;
      state.error = action.payload;
    },

    // Reject Boost
    rejectBoostRequest: (
      state,
      _action: PayloadAction<{ boostId: string; reason?: string }>
    ) => {
      state.isProcessing = true;
      state.error = null;
    },
    rejectBoostSuccess: (state, action: PayloadAction<Boost>) => {
      state.isProcessing = false;
      const index = state.boosts.findIndex((b) => b.boostId === action.payload.boostId);
      if (index !== -1) {
        state.boosts[index] = action.payload;
      }
      if (state.currentBoost?.boostId === action.payload.boostId) {
        state.currentBoost = { ...state.currentBoost, ...action.payload };
      }
      state.error = null;
    },
    rejectBoostFailure: (state, action: PayloadAction<string>) => {
      state.isProcessing = false;
      state.error = action.payload;
    },

    // Fetch Statistics
    fetchStatisticsRequest: (state) => {
      state.isLoadingStats = true;
      state.error = null;
    },
    fetchStatisticsSuccess: (state, action: PayloadAction<BoostStatistics>) => {
      state.isLoadingStats = false;
      state.statistics = action.payload;
      state.error = null;
    },
    fetchStatisticsFailure: (state, action: PayloadAction<string>) => {
      state.isLoadingStats = false;
      state.error = action.payload;
    },

    // Set Filters
    setFilters: (state, action: PayloadAction<Partial<BoostFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page when filters change
    },

    // Set Page
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },

    // Clear Current Boost
    clearCurrentBoost: (state) => {
      state.currentBoost = null;
    },

    // Create Boost
    createBoostRequest: (
      state,
      _action: PayloadAction<{
        astrologerId: string;
        durationDays: number;
        startDate?: string;
      }>
    ) => {
      state.isProcessing = true;
      state.error = null;
    },
    createBoostSuccess: (state, action: PayloadAction<Boost>) => {
      state.isProcessing = false;
      state.boosts.unshift(action.payload);
      state.error = null;
    },
    createBoostFailure: (state, action: PayloadAction<string>) => {
      state.isProcessing = false;
      state.error = action.payload;
    },

    // Cancel Boost
    cancelBoostRequest: (
      state,
      _action: PayloadAction<{ boostId: string; reason: string }>
    ) => {
      state.isProcessing = true;
      state.error = null;
    },
    cancelBoostSuccess: (state, action: PayloadAction<Boost>) => {
      state.isProcessing = false;
      const index = state.boosts.findIndex((b) => b.boostId === action.payload.boostId);
      if (index !== -1) {
        state.boosts[index] = action.payload;
      }
      if (state.currentBoost?.boostId === action.payload.boostId) {
        state.currentBoost = { ...state.currentBoost, ...action.payload };
      }
      state.error = null;
    },
    cancelBoostFailure: (state, action: PayloadAction<string>) => {
      state.isProcessing = false;
      state.error = action.payload;
    },

    // Trigger Expiry
    triggerExpiryRequest: (state) => {
      state.isProcessing = true;
      state.error = null;
    },
    triggerExpirySuccess: (state) => {
      state.isProcessing = false;
      state.error = null;
    },
    triggerExpiryFailure: (state, action: PayloadAction<string>) => {
      state.isProcessing = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchBoostsRequest,
  fetchBoostsSuccess,
  fetchBoostsFailure,
  fetchBoostDetailsRequest,
  fetchBoostDetailsSuccess,
  fetchBoostDetailsFailure,
  approveBoostRequest,
  approveBoostSuccess,
  approveBoostFailure,
  rejectBoostRequest,
  rejectBoostSuccess,
  rejectBoostFailure,
  fetchStatisticsRequest,
  fetchStatisticsSuccess,
  fetchStatisticsFailure,
  createBoostRequest,
  createBoostSuccess,
  createBoostFailure,
  cancelBoostRequest,
  cancelBoostSuccess,
  cancelBoostFailure,
  triggerExpiryRequest,
  triggerExpirySuccess,
  triggerExpiryFailure,
  setFilters,
  setPage,
  clearCurrentBoost,
} = adCentreSlice.actions;

export default adCentreSlice.reducer;

