import apiClient from './client';
import {
  Astrologer,
  AstrologerStats,
  ApproveAstrologerRequest,
  SuspendAstrologerRequest,
  UpdateAstrologerRequest,
  PaginatedResponse,
  PaginationParams,
  ApiResponse,
} from '@/types';

export const astrologersApi = {
  getAll: async (params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Astrologer>>> => {
    const response = await apiClient.get('/admin/astrologers', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Astrologer>> => {
    const response = await apiClient.get(`/admin/astrologers/${id}`);
    return response.data;
  },

  update: async (id: string, data: UpdateAstrologerRequest): Promise<ApiResponse<Astrologer>> => {
    const response = await apiClient.put(`/admin/astrologers/${id}`, data);
    return response.data;
  },

  approve: async (id: string, data: ApproveAstrologerRequest): Promise<ApiResponse<Astrologer>> => {
    const response = await apiClient.patch(`/admin/astrologers/${id}/approve`, data);
    return response.data;
  },

  suspend: async (id: string, data: SuspendAstrologerRequest): Promise<ApiResponse<Astrologer>> => {
    const response = await apiClient.patch(`/admin/astrologers/${id}/suspend`, data);
    return response.data;
  },

  unsuspend: async (id: string): Promise<ApiResponse<Astrologer>> => {
    const response = await apiClient.patch(`/admin/astrologers/${id}/unsuspend`);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/admin/astrologers/${id}`);
    return response.data;
  },

  getStats: async (id: string): Promise<ApiResponse<AstrologerStats>> => {
    const response = await apiClient.get(`/admin/astrologers/${id}/stats`);
    return response.data;
  },
};

