import apiClient from './client';
import {
  Review,
  ReviewStats,
  ModerateReviewRequest,
  PaginatedResponse,
  PaginationParams,
  ApiResponse,
} from '@/types';

export const reviewsApi = {
  getAll: async (params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Review>>> => {
    const response = await apiClient.get('/admin/reviews', { params });
    return response.data;
  },

  moderate: async (id: string, data: ModerateReviewRequest): Promise<ApiResponse<Review>> => {
    const response = await apiClient.patch(`/admin/reviews/${id}/moderate`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/admin/reviews/${id}`);
    return response.data;
  },

  getStats: async (): Promise<ApiResponse<ReviewStats>> => {
    const response = await apiClient.get('/admin/reviews/stats');
    return response.data;
  },
};

