import apiClient from './client';
import { ApiResponse } from '@/types';

export interface RevenueData {
  date: string;
  consultations: number;
  services: number;
  liveStreams: number;
  total: number;
}

export interface GrowthData {
  date: string;
  astrologers: number;
  users: number;
  consultations: number;
  revenue: number;
}

export const analyticsApi = {
  getRevenue: async (params: { startDate: string; endDate: string; groupBy?: 'day' | 'week' | 'month' }): Promise<ApiResponse<RevenueData[]>> => {
    const response = await apiClient.get('/admin/analytics/revenue', { params });
    return response.data;
  },

  getGrowth: async (params: { startDate: string; endDate: string; groupBy?: 'day' | 'week' | 'month' }): Promise<ApiResponse<GrowthData[]>> => {
    const response = await apiClient.get('/admin/analytics/growth', { params });
    return response.data;
  },
};

