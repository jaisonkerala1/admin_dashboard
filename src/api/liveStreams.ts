import apiClient from './client';
import {
  LiveStream,
  LiveStreamStats,
  EndLiveStreamRequest,
  PaginatedResponse,
  PaginationParams,
  ApiResponse,
} from '@/types';

export const liveStreamsApi = {
  getAll: async (params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<LiveStream>>> => {
    const response = await apiClient.get('/admin/live-streams', { params });
    return response.data;
  },

  end: async (id: string, data?: EndLiveStreamRequest): Promise<ApiResponse<LiveStream>> => {
    const response = await apiClient.post(`/admin/live-streams/${id}/end`, data);
    return response.data;
  },

  getStats: async (): Promise<ApiResponse<LiveStreamStats>> => {
    const response = await apiClient.get('/admin/live-streams/stats');
    return response.data;
  },
};

