import apiClient from './client';
import { AnalyticsData } from '../types';

export const analyticsApi = {
  /**
   * Get complete analytics data
   */
  getAnalytics: async (period: 'daily' | 'weekly' | 'monthly' = 'monthly'): Promise<any> => {
    const response = await apiClient.get(`/admin/analytics?period=${period}`);
    return response.data;
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
