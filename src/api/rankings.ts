import apiClient from './client';
import { RankingsResponse, RankingCategoryId, BulkActionRequest, ApiResponse } from '@/types';

export const rankingsApi = {
  getRankings: async (
    category: RankingCategoryId,
    params?: {
      includeHidden?: boolean;
      limit?: number;
      recalculate?: boolean;
    }
  ): Promise<RankingsResponse> => {
    const response = await apiClient.get(`/admin/rankings/${category}`, { params });
    return response.data;
  },

  reorderRankings: async (
    category: RankingCategoryId,
    order: string[]
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.put(`/admin/rankings/${category}/reorder`, { order });
    return response.data;
  },

  pinAstrologer: async (
    astrologerId: string,
    category: RankingCategoryId,
    position?: number
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.patch(`/admin/rankings/${astrologerId}/pin`, {
      category,
      position,
    });
    return response.data;
  },

  unpinAstrologer: async (
    astrologerId: string,
    category: RankingCategoryId
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.patch(`/admin/rankings/${astrologerId}/unpin`, { category });
    return response.data;
  },

  hideAstrologer: async (
    astrologerId: string,
    category: RankingCategoryId
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.patch(`/admin/rankings/${astrologerId}/hide`, { category });
    return response.data;
  },

  unhideAstrologer: async (
    astrologerId: string,
    category: RankingCategoryId
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.patch(`/admin/rankings/${astrologerId}/unhide`, { category });
    return response.data;
  },

  bulkActions: async (request: BulkActionRequest): Promise<ApiResponse<void>> => {
    const response = await apiClient.post('/admin/rankings/bulk-actions', request);
    return response.data;
  },

  previewRankings: async (category: RankingCategoryId): Promise<RankingsResponse> => {
    const response = await apiClient.get(`/admin/rankings/${category}/preview`);
    return response.data;
  },

  addAstrologers: async (
    category: RankingCategoryId,
    astrologerIds: string[]
  ): Promise<RankingsResponse> => {
    const response = await apiClient.post(`/admin/rankings/${category}/add`, {
      astrologerIds,
    });
    return response.data;
  },
};

