import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  CommunicationStats,
  CommunicationTrend,
  AstrologerCommunicationStats,
  CallDurationStats,
  PeakHoursData,
  CallSuccessRateTrend,
  CommunicationPeriod,
  CommunicationType,
} from '@/types/communication';

interface CommunicationState {
  // Stats
  stats: CommunicationStats | null;
  
  // Trends
  trends: CommunicationTrend[];
  
  // Astrologer Stats
  astrologerStats: AstrologerCommunicationStats[];
  
  // Call Duration Stats
  callDurationStats: CallDurationStats[];
  
  // Peak Hours
  peakHours: PeakHoursData[];
  
  // Success Rate Trends
  successRateTrends: CallSuccessRateTrend[];
  
  // Filters
  period: CommunicationPeriod;
  communicationType: CommunicationType;
  
  // Loading States
  isLoadingStats: boolean;
  isLoadingTrends: boolean;
  isLoadingAstrologerStats: boolean;
  isLoadingCallDuration: boolean;
  isLoadingPeakHours: boolean;
  isLoadingSuccessRate: boolean;
  
  // Error States
  statsError: string | null;
  trendsError: string | null;
  astrologerStatsError: string | null;
  callDurationError: string | null;
  peakHoursError: string | null;
  successRateError: string | null;
}

const initialState: CommunicationState = {
  stats: null,
  trends: [],
  astrologerStats: [],
  callDurationStats: [],
  peakHours: [],
  successRateTrends: [],
  period: '7d',
  communicationType: 'customer-astrologer',
  isLoadingStats: false,
  isLoadingTrends: false,
  isLoadingAstrologerStats: false,
  isLoadingCallDuration: false,
  isLoadingPeakHours: false,
  isLoadingSuccessRate: false,
  statsError: null,
  trendsError: null,
  astrologerStatsError: null,
  callDurationError: null,
  peakHoursError: null,
  successRateError: null,
};

const communicationSlice = createSlice({
  name: 'communication',
  initialState,
  reducers: {
    // Fetch Stats
    fetchStatsRequest: (state, _action: PayloadAction<{ period: CommunicationPeriod }>) => {
      state.isLoadingStats = true;
      state.statsError = null;
    },
    fetchStatsSuccess: (state, action: PayloadAction<CommunicationStats>) => {
      state.isLoadingStats = false;
      state.stats = action.payload;
      state.statsError = null;
    },
    fetchStatsFailure: (state, action: PayloadAction<string>) => {
      state.isLoadingStats = false;
      state.statsError = action.payload;
    },

    // Fetch Trends
    fetchTrendsRequest: (state, _action: PayloadAction<{ period: CommunicationPeriod }>) => {
      state.isLoadingTrends = true;
      state.trendsError = null;
    },
    fetchTrendsSuccess: (state, action: PayloadAction<CommunicationTrend[]>) => {
      state.isLoadingTrends = false;
      state.trends = action.payload;
      state.trendsError = null;
    },
    fetchTrendsFailure: (state, action: PayloadAction<string>) => {
      state.isLoadingTrends = false;
      state.trendsError = action.payload;
    },

    // Fetch Astrologer Stats
    fetchAstrologerStatsRequest: (state, _action: PayloadAction<{ period: CommunicationPeriod }>) => {
      state.isLoadingAstrologerStats = true;
      state.astrologerStatsError = null;
    },
    fetchAstrologerStatsSuccess: (state, action: PayloadAction<AstrologerCommunicationStats[]>) => {
      state.isLoadingAstrologerStats = false;
      state.astrologerStats = action.payload;
      state.astrologerStatsError = null;
    },
    fetchAstrologerStatsFailure: (state, action: PayloadAction<string>) => {
      state.isLoadingAstrologerStats = false;
      state.astrologerStatsError = action.payload;
    },

    // Fetch Call Duration Stats
    fetchCallDurationStatsRequest: (state, _action: PayloadAction<{ period: CommunicationPeriod }>) => {
      state.isLoadingCallDuration = true;
      state.callDurationError = null;
    },
    fetchCallDurationStatsSuccess: (state, action: PayloadAction<CallDurationStats[]>) => {
      state.isLoadingCallDuration = false;
      state.callDurationStats = action.payload;
      state.callDurationError = null;
    },
    fetchCallDurationStatsFailure: (state, action: PayloadAction<string>) => {
      state.isLoadingCallDuration = false;
      state.callDurationError = action.payload;
    },

    // Fetch Peak Hours
    fetchPeakHoursRequest: (state, _action: PayloadAction<{ period: CommunicationPeriod }>) => {
      state.isLoadingPeakHours = true;
      state.peakHoursError = null;
    },
    fetchPeakHoursSuccess: (state, action: PayloadAction<PeakHoursData[]>) => {
      state.isLoadingPeakHours = false;
      state.peakHours = action.payload;
      state.peakHoursError = null;
    },
    fetchPeakHoursFailure: (state, action: PayloadAction<string>) => {
      state.isLoadingPeakHours = false;
      state.peakHoursError = action.payload;
    },

    // Fetch Success Rate Trends
    fetchSuccessRateTrendsRequest: (state, _action: PayloadAction<{ period: CommunicationPeriod }>) => {
      state.isLoadingSuccessRate = true;
      state.successRateError = null;
    },
    fetchSuccessRateTrendsSuccess: (state, action: PayloadAction<CallSuccessRateTrend[]>) => {
      state.isLoadingSuccessRate = false;
      state.successRateTrends = action.payload;
      state.successRateError = null;
    },
    fetchSuccessRateTrendsFailure: (state, action: PayloadAction<string>) => {
      state.isLoadingSuccessRate = false;
      state.successRateError = action.payload;
    },

    // Set Period
    setPeriod: (state, action: PayloadAction<CommunicationPeriod>) => {
      state.period = action.payload;
    },

    // Set Communication Type
    setCommunicationType: (state, action: PayloadAction<CommunicationType>) => {
      state.communicationType = action.payload;
    },
  },
});

export const {
  fetchStatsRequest,
  fetchStatsSuccess,
  fetchStatsFailure,
  fetchTrendsRequest,
  fetchTrendsSuccess,
  fetchTrendsFailure,
  fetchAstrologerStatsRequest,
  fetchAstrologerStatsSuccess,
  fetchAstrologerStatsFailure,
  fetchCallDurationStatsRequest,
  fetchCallDurationStatsSuccess,
  fetchCallDurationStatsFailure,
  fetchPeakHoursRequest,
  fetchPeakHoursSuccess,
  fetchPeakHoursFailure,
  fetchSuccessRateTrendsRequest,
  fetchSuccessRateTrendsSuccess,
  fetchSuccessRateTrendsFailure,
  setPeriod,
  setCommunicationType,
} = communicationSlice.actions;

export default communicationSlice.reducer;

