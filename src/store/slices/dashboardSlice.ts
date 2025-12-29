import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Astrologer, LiveStream, DashboardStats } from '@/types';

export type DashboardPeriod = '1d' | '7d' | '1m' | '1y' | '3y';

export interface DashboardPeriodStats {
  astrologersNew: number;
  usersNew: number;
  consultations: number;
  completedConsultations: number;
  revenue: number;
  serviceRequests: number;
}

export interface DashboardChartPoint {
  label: string;
  consultations: number;
  serviceRequests: number;
}

interface DashboardState {
  period: DashboardPeriod;
  isLoading: boolean;
  error: string | null;
  periodStats: DashboardPeriodStats | null;
  chartData: DashboardChartPoint[];

  globalStats: DashboardStats | null;
  globalLoading: boolean;

  liveStreams: LiveStream[];
  liveLoading: boolean;

  onlineAstrologers: Astrologer[];
  onlineLoading: boolean;
}

const initialState: DashboardState = {
  period: '7d',
  isLoading: false,
  error: null,
  periodStats: null,
  chartData: [],

  globalStats: null,
  globalLoading: false,

  liveStreams: [],
  liveLoading: false,

  onlineAstrologers: [],
  onlineLoading: false,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setPeriod: (state, action: PayloadAction<DashboardPeriod>) => {
      state.period = action.payload;
    },

    fetchDashboardRequest: (state, _action: PayloadAction<{ period: DashboardPeriod }>) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchDashboardSuccess: (
      state,
      action: PayloadAction<{ periodStats: DashboardPeriodStats; chartData: DashboardChartPoint[] }>
    ) => {
      state.isLoading = false;
      state.error = null;
      state.periodStats = action.payload.periodStats;
      state.chartData = action.payload.chartData;
    },
    fetchDashboardFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    fetchGlobalStatsRequest: (state) => {
      state.globalLoading = true;
    },
    fetchGlobalStatsSuccess: (state, action: PayloadAction<DashboardStats>) => {
      state.globalLoading = false;
      state.globalStats = action.payload;
    },
    fetchGlobalStatsFailure: (state) => {
      state.globalLoading = false;
    },

    fetchLiveStreamsRequest: (state) => {
      state.liveLoading = true;
    },
    fetchLiveStreamsSuccess: (state, action: PayloadAction<LiveStream[]>) => {
      state.liveLoading = false;
      state.liveStreams = action.payload;
    },
    fetchLiveStreamsFailure: (state) => {
      state.liveLoading = false;
    },

    fetchOnlineAstrologersRequest: (state) => {
      state.onlineLoading = true;
    },
    fetchOnlineAstrologersSuccess: (state, action: PayloadAction<Astrologer[]>) => {
      state.onlineLoading = false;
      state.onlineAstrologers = action.payload;
    },
    fetchOnlineAstrologersFailure: (state) => {
      state.onlineLoading = false;
    },

    // Update single astrologer status (for real-time updates)
    updateAstrologerStatus: (state, action: PayloadAction<{ astrologerId: string; isOnline: boolean; lastSeen: string }>) => {
      const { astrologerId, isOnline, lastSeen } = action.payload;
      
      // Update astrologer in onlineAstrologers list
      const index = state.onlineAstrologers.findIndex(a => a._id === astrologerId);
      if (index !== -1) {
        state.onlineAstrologers[index].isOnline = isOnline;
        state.onlineAstrologers[index].lastSeen = lastSeen;
        
        // Remove from online list if they went offline
        if (!isOnline) {
          state.onlineAstrologers.splice(index, 1);
        }
      } else if (isOnline) {
        // If astrologer went online and is not in the list, they'll be added on next refresh
        // (We don't add them here because we don't have full astrologer data)
      }
    },
  },
});

export const {
  setPeriod,
  fetchDashboardRequest,
  fetchDashboardSuccess,
  fetchDashboardFailure,
  fetchGlobalStatsRequest,
  fetchGlobalStatsSuccess,
  fetchGlobalStatsFailure,
  fetchLiveStreamsRequest,
  fetchLiveStreamsSuccess,
  fetchLiveStreamsFailure,
  fetchOnlineAstrologersRequest,
  fetchOnlineAstrologersSuccess,
  fetchOnlineAstrologersFailure,
  updateAstrologerStatus,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;


