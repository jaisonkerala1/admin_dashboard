import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CommunicationTrendPoint } from '@/types/analytics';

interface CommunicationAnalyticsState {
  trends: CommunicationTrendPoint[];
  isLoading: boolean;
  error: string | null;
  activeMetric: 'messages' | 'voice' | 'video';
  period: '7d' | '30d' | '90d';
}

const initialState: CommunicationAnalyticsState = {
  trends: [],
  isLoading: false,
  error: null,
  activeMetric: 'messages',
  period: '30d',
};

const communicationAnalyticsSlice = createSlice({
  name: 'communicationAnalytics',
  initialState,
  reducers: {
    fetchCommunicationTrendsRequest: (state, _action: PayloadAction<{ period?: '7d' | '30d' | '90d' }>) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchCommunicationTrendsSuccess: (state, action: PayloadAction<CommunicationTrendPoint[]>) => {
      state.isLoading = false;
      state.trends = action.payload;
    },
    fetchCommunicationTrendsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setActiveMetric: (state, action: PayloadAction<'messages' | 'voice' | 'video'>) => {
      state.activeMetric = action.payload;
    },
    setPeriod: (state, action: PayloadAction<'7d' | '30d' | '90d'>) => {
      state.period = action.payload;
    },
  },
});

export const {
  fetchCommunicationTrendsRequest,
  fetchCommunicationTrendsSuccess,
  fetchCommunicationTrendsFailure,
  setActiveMetric,
  setPeriod,
} = communicationAnalyticsSlice.actions;

export default communicationAnalyticsSlice.reducer;

