import apiClient from './client';
import { ApiResponse, AnalyticsData } from '../types';

export const analyticsApi = {
  /**
   * Get complete analytics data
   */
  getAnalytics: (period: 'daily' | 'weekly' | 'monthly' = 'monthly'): Promise<ApiResponse<AnalyticsData>> => {
    return apiClient.get(`/admin/analytics?period=${period}`);
  },

  /**
   * Get revenue analytics
   */
  getRevenueAnalytics: (period: 'daily' | 'weekly' | 'monthly' = 'monthly') => {
    return apiClient.get(`/admin/analytics/revenue?period=${period}`);
  },

  /**
   * Get growth analytics
   */
  getGrowthAnalytics: (period: 'daily' | 'weekly' | 'monthly' = 'monthly') => {
    return apiClient.get(`/admin/analytics/growth?period=${period}`);
  }
};
