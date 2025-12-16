import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, ADMIN_SECRET_KEY } from '@/utils/constants';
import { storage, AUTH_STORAGE_KEY } from '@/utils/storage';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add admin authentication
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get admin key from storage or env
    const storedAuth = storage.get<{ adminKey: string }>(AUTH_STORAGE_KEY);
    const adminKey = storedAuth?.adminKey || ADMIN_SECRET_KEY;

    if (adminKey) {
      config.headers['x-admin-key'] = adminKey;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const data: any = error.response.data;

      // Handle authentication errors
      if (status === 401 || status === 403) {
        storage.remove(AUTH_STORAGE_KEY);
        window.location.href = '/login';
      }

      // Return formatted error
      return Promise.reject({
        status,
        message: data?.message || data?.error || 'An error occurred',
        data: data,
      });
    }

    if (error.request) {
      return Promise.reject({
        status: 0,
        message: 'Network error. Please check your connection.',
      });
    }

    return Promise.reject({
      status: 0,
      message: error.message || 'An unexpected error occurred',
    });
  }
);

export default apiClient;

