import apiClient from './client';

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
  },

  /**
   * Get communication trends
   */
  getCommunicationTrends: (period: '7d' | '30d' | '90d' = '30d') => {
    return apiClient.get(`/admin/analytics/communication-trends?period=${period}`);
  }
};
