import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginRequest, logout as logoutAction } from '@/store/slices/authSlice';
import { store } from '@/store';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, adminKey, isLoading, error } = useAppSelector((state) => state.auth);

  const login = async (key: string) => {
    // Dispatch login request action - saga will handle the async logic
    dispatch(loginRequest(key));
    
    // Wait a bit for the saga to complete
    // In a real app, you'd handle this with a promise or callback
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const state = store.getState();
        if (state?.auth?.isAuthenticated) {
          resolve(undefined);
        } else {
          reject(new Error(state?.auth?.error || 'Login failed'));
        }
      }, 1000);
    });
  };

  const logout = () => {
    dispatch(logoutAction());
  };

  return {
    isAuthenticated,
    adminKey,
    isLoading,
    error,
    login,
    logout,
  };
};

