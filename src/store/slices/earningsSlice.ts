import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EarningsData, EarningsPeriod } from '@/types/earnings';

interface EarningsState {
  period: EarningsPeriod;
  data: EarningsData | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: EarningsState = {
  period: '1m',
  data: null,
  isLoading: false,
  error: null,
};

const earningsSlice = createSlice({
  name: 'earnings',
  initialState,
  reducers: {
    // Action to trigger saga
    fetchEarningsRequest: (state, action: PayloadAction<{ period: EarningsPeriod }>) => {
      state.isLoading = true;
      state.error = null;
      state.period = action.payload.period;
    },
    // Success action from saga
    fetchEarningsSuccess: (state, action: PayloadAction<EarningsData>) => {
      state.isLoading = false;
      state.data = action.payload;
      state.error = null;
    },
    // Failure action from saga
    fetchEarningsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    // Change period
    setPeriod: (state, action: PayloadAction<EarningsPeriod>) => {
      state.period = action.payload;
    },
  },
});

export const {
  fetchEarningsRequest,
  fetchEarningsSuccess,
  fetchEarningsFailure,
  setPeriod,
} = earningsSlice.actions;

export default earningsSlice.reducer;

