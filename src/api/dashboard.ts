import apiClient from './client';
import { DashboardStats, ApiResponse } from '@/types';

export const dashboardApi = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await apiClient.get('/admin/dashboard/stats');
    return response.data;
  },
};

