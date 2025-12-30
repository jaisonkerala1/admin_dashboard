import apiClient from './client';
import {
  Astrologer,
  AstrologerStats,
  ApproveAstrologerRequest,
  SuspendAstrologerRequest,
  UpdateAstrologerRequest,
  PaginationParams,
  ApiResponse,
} from '@/types';

// Custom response type that matches backend
interface AstrologersListResponse {
  success: boolean;
  data: Astrologer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const astrologersApi = {
  getAll: async (params?: PaginationParams): Promise<AstrologersListResponse> => {
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

  uploadProfilePicture: async (id: string, file: File): Promise<ApiResponse<{ profilePicture: string }>> => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    const response = await apiClient.post(`/admin/astrologers/${id}/profile-picture`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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

  verify: async (id: string): Promise<ApiResponse<Astrologer>> => {
    const response = await apiClient.patch(`/admin/astrologers/${id}/verify`);
    return response.data;
  },

  unverify: async (id: string): Promise<ApiResponse<Astrologer>> => {
    const response = await apiClient.patch(`/admin/astrologers/${id}/unverify`);
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

  getOnlineList: async (): Promise<ApiResponse<Astrologer[]>> => {
    const response = await apiClient.get('/admin/astrologers/online/list');
    return response.data;
  },
};

