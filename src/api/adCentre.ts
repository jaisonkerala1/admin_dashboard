import apiClient from './client';
import type { ApiResponse } from '@/types';
import type { Boost, BoostDetails, BoostStatistics, BoostFilters, BoostPagination } from '@/store/slices/adCentreSlice';

export interface BoostsListResponse {
  success: boolean;
  data: {
    boosts: Boost[];
    pagination: BoostPagination;
  };
}

export interface BoostDetailsResponse {
  success: boolean;
  data: {
    boost: Boost;
    astrologer: BoostDetails['astrologer'];
  };
}

export interface BoostStatisticsResponse {
  success: boolean;
  data: BoostStatistics;
}

export const adCentreApi = {
  getAllBoosts: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<BoostsListResponse> => {
    const response = await apiClient.get('/admin/ad-centre/boosts', { params });
    return response.data;
  },

  getBoostDetails: async (boostId: string): Promise<BoostDetailsResponse> => {
    const response = await apiClient.get(`/admin/ad-centre/boosts/${boostId}`);
    return response.data;
  },

  approveBoost: async (boostId: string): Promise<ApiResponse<Boost>> => {
    const response = await apiClient.post(`/admin/ad-centre/boosts/${boostId}/approve`);
    return response.data;
  },

  rejectBoost: async (boostId: string, reason?: string): Promise<ApiResponse<Boost>> => {
    const response = await apiClient.post(`/admin/ad-centre/boosts/${boostId}/reject`, { reason });
    return response.data;
  },

  getStatistics: async (): Promise<BoostStatisticsResponse> => {
    const response = await apiClient.get('/admin/ad-centre/statistics');
    return response.data;
  },
};

