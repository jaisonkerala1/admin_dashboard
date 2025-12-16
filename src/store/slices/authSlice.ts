import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { storage, AUTH_STORAGE_KEY } from '@/utils/storage';

interface AuthState {
  isAuthenticated: boolean;
  adminKey: string | null;
  isLoading: boolean;
  error: string | null;
}

// Initialize from storage
const storedAuth = storage.get<{ adminKey: string }>(AUTH_STORAGE_KEY);

const initialState: AuthState = {
  isAuthenticated: !!storedAuth?.adminKey,
  adminKey: storedAuth?.adminKey || null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login actions
    loginRequest: (state, action: PayloadAction<string>) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = true;
      state.adminKey = action.payload;
      state.isLoading = false;
      state.error = null;
      storage.set(AUTH_STORAGE_KEY, { adminKey: action.payload });
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = false;
      state.adminKey = null;
      state.isLoading = false;
      state.error = action.payload;
      storage.remove(AUTH_STORAGE_KEY);
    },
    
    // Logout action
    logout: (state) => {
      state.isAuthenticated = false;
      state.adminKey = null;
      state.isLoading = false;
      state.error = null;
      storage.remove(AUTH_STORAGE_KEY);
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  loginRequest,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
