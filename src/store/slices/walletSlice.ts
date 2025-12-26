import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WalletData, WalletPeriod } from '@/types/wallet';

interface WalletState {
  period: WalletPeriod;
  data: WalletData | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: WalletState = {
  period: 'thisMonth',
  data: null,
  isLoading: false,
  error: null,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    // Action to trigger saga
    fetchWalletDataRequest: (state, action: PayloadAction<{ period: WalletPeriod }>) => {
      state.isLoading = true;
      state.error = null;
      state.period = action.payload.period;
    },
    // Success action from saga
    fetchWalletDataSuccess: (state, action: PayloadAction<WalletData>) => {
      state.isLoading = false;
      state.data = action.payload;
      state.error = null;
    },
    // Failure action from saga
    fetchWalletDataFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    // Change period
    setPeriod: (state, action: PayloadAction<WalletPeriod>) => {
      state.period = action.payload;
    },
  },
});

export const {
  fetchWalletDataRequest,
  fetchWalletDataSuccess,
  fetchWalletDataFailure,
  setPeriod,
} = walletSlice.actions;

export default walletSlice.reducer;

