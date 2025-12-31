import apiClient from './client';
import {
  Review,
  ReviewStats,
  ModerateReviewRequest,
  CreateReviewRequest,
  UpdateReviewRequest,
  PaginationParams,
  ApiResponse,
} from '@/types';

// Custom response type that matches backend
interface ReviewsListResponse {
  success: boolean;
  data: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const reviewsApi = {
  getAll: async (params?: PaginationParams & {
    astrologerId?: string;
    isAdminCreated?: boolean;
    isPublic?: boolean;
    isModerated?: boolean;
    needsReply?: boolean;
    minRating?: number;
    maxRating?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ReviewsListResponse> => {
    const response = await apiClient.get('/admin/reviews', { params });
    return response.data;
  },

  create: async (data: CreateReviewRequest): Promise<ApiResponse<Review>> => {
    const response = await apiClient.post('/admin/reviews', data);
    return response.data;
  },

  update: async (id: string, data: UpdateReviewRequest): Promise<ApiResponse<Review>> => {
    const response = await apiClient.put(`/admin/reviews/${id}`, data);
    return response.data;
  },

  moderate: async (id: string, data: ModerateReviewRequest): Promise<ApiResponse<Review>> => {
    const response = await apiClient.patch(`/admin/reviews/${id}/moderate`, data);
    return response.data;
  },

  delete: async (id: string, data?: { moderationReason?: string }): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/admin/reviews/${id}`, { 
      data // Send in request body
    });
    return response.data;
  },

  bulkDelete: async (ids: string[], moderationReason?: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete('/admin/reviews/bulk', {
      data: { ids, moderationReason }
    });
    return response.data;
  },

  getStats: async (): Promise<ApiResponse<ReviewStats>> => {
    const response = await apiClient.get('/admin/reviews/stats');
    return response.data;
  },
};

