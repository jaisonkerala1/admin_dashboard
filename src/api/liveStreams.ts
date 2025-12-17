import apiClient from './client';
import {
  LiveStream,
  LiveStreamStats,
  EndLiveStreamRequest,
  PaginationParams,
  ApiResponse,
} from '@/types';

// Custom response type that matches backend
interface LiveStreamsListResponse {
  success: boolean;
  data: LiveStream[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const liveStreamsApi = {
  getAll: async (params?: PaginationParams): Promise<LiveStreamsListResponse> => {
    const response = await apiClient.get('/admin/live-streams', { params });
    return response.data;
  },

  end: async (id: string, data?: EndLiveStreamRequest): Promise<ApiResponse<LiveStream>> => {
    const response = await apiClient.post(`/admin/live-streams/${id}/end`, data);
    return response.data;
  },

  endAll: async (): Promise<ApiResponse<{ endedCount: number; streamIds: string[] }>> => {
    const response = await apiClient.post('/admin/live-streams/end-all');
    return response.data;
  },

  ban: async (id: string, reason?: string): Promise<ApiResponse<LiveStream>> => {
    const response = await apiClient.post(`/admin/live-streams/${id}/ban`, { reason });
    return response.data;
  },

  warn: async (id: string, message?: string): Promise<ApiResponse<{ warningCount: number }>> => {
    const response = await apiClient.post(`/admin/live-streams/${id}/warn`, { message });
    return response.data;
  },

  banViewer: async (id: string, viewerId: string, reason?: string): Promise<ApiResponse<{ bannedViewerCount: number }>> => {
    const response = await apiClient.post(`/admin/live-streams/${id}/ban-viewer`, { viewerId, reason });
    return response.data;
  },

  getAgoraToken: async (id: string): Promise<ApiResponse<{ token: string; channelName: string; appId: string; uid: number }>> => {
    const response = await apiClient.get(`/admin/live-streams/${id}/token`);
    return response.data;
  },

  getStats: async (): Promise<ApiResponse<LiveStreamStats>> => {
    const response = await apiClient.get('/admin/live-streams/stats');
    return response.data;
  },
};

