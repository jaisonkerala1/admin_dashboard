import apiClient from './client';
import {
  Discussion,
  DiscussionStats,
  ModerateDiscussionRequest,
  PaginationParams,
  ApiResponse,
} from '@/types';

// Custom response type that matches backend
interface DiscussionsListResponse {
  success: boolean;
  data: Discussion[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const discussionsApi = {
  getAll: async (params?: PaginationParams): Promise<DiscussionsListResponse> => {
    const response = await apiClient.get('/admin/discussions', { params });
    return response.data;
  },

  moderate: async (id: string, data: ModerateDiscussionRequest): Promise<ApiResponse<Discussion>> => {
    const response = await apiClient.patch(`/admin/discussions/${id}/moderate`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/admin/discussions/${id}`);
    return response.data;
  },

  deleteComment: async (commentId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/admin/discussions/comments/${commentId}`);
    return response.data;
  },

  getStats: async (): Promise<ApiResponse<DiscussionStats>> => {
    const response = await apiClient.get('/admin/discussions/stats');
    return response.data;
  },
};

