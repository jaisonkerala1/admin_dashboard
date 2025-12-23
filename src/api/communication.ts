import apiClient from './client';
import type {
  CommunicationStats,
  CommunicationTrend,
  AstrologerCommunicationStats,
  CallDurationStats,
  PeakHoursData,
  CallSuccessRateTrend,
  CommunicationPeriod,
  CommunicationType,
} from '@/types/communication';
import type { ApiResponse } from '@/types';

export const communicationApi = {
  // Get overview statistics
  getCommunicationStats: async (
    period: CommunicationPeriod = '7d',
    type: CommunicationType = 'all'
  ): Promise<ApiResponse<CommunicationStats>> => {
    const response = await apiClient.get<ApiResponse<CommunicationStats>>('/admin/communications/stats', {
      params: { period, type },
    });
    return response.data;
  },

  // Get communication trends over time
  getCommunicationTrends: async (
    period: CommunicationPeriod = '7d',
    type: CommunicationType = 'all'
  ): Promise<ApiResponse<CommunicationTrend[]>> => {
    const response = await apiClient.get<ApiResponse<CommunicationTrend[]>>('/admin/communications/trends', {
      params: { period, type },
    });
    return response.data;
  },

  // Get communication stats by astrologer
  getAstrologerCommunicationStats: async (
    period: CommunicationPeriod = '7d',
    type: CommunicationType = 'all'
  ): Promise<ApiResponse<AstrologerCommunicationStats[]>> => {
    const response = await apiClient.get<ApiResponse<AstrologerCommunicationStats[]>>('/admin/communications/astrologers', {
      params: { period, type },
    });
    return response.data;
  },

  // Get call duration statistics
  getCallDurationStats: async (
    period: CommunicationPeriod = '7d',
    type: CommunicationType = 'all'
  ): Promise<ApiResponse<CallDurationStats[]>> => {
    const response = await apiClient.get<ApiResponse<CallDurationStats[]>>('/admin/communications/call-duration', {
      params: { period, type },
    });
    return response.data;
  },

  // Get peak hours data
  getPeakHours: async (
    period: CommunicationPeriod = '7d',
    type: CommunicationType = 'all'
  ): Promise<ApiResponse<PeakHoursData[]>> => {
    const response = await apiClient.get<ApiResponse<PeakHoursData[]>>('/admin/communications/peak-hours', {
      params: { period, type },
    });
    return response.data;
  },

  // Get call success rate trends
  getCallSuccessRateTrends: async (
    period: CommunicationPeriod = '7d',
    type: CommunicationType = 'all'
  ): Promise<ApiResponse<CallSuccessRateTrend[]>> => {
    const response = await apiClient.get<ApiResponse<CallSuccessRateTrend[]>>('/admin/communications/success-rates', {
      params: { period, type },
    });
    return response.data;
  },
};

