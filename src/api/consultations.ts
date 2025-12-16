import apiClient from './client';
import {
  Consultation,
  ConsultationStats,
  UpdateConsultationRequest,
  PaginationParams,
} from '@/types';

// Custom response type that matches actual backend response
interface ConsultationsListResponse {
  success: boolean;
  data: Consultation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const consultationsApi = {
  getAll: async (params?: PaginationParams): Promise<ConsultationsListResponse> => {
    const response = await apiClient.get('/admin/consultations', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Consultation>> => {
    const response = await apiClient.get(`/admin/consultations/${id}`);
    return response.data;
  },

  update: async (id: string, data: UpdateConsultationRequest): Promise<ApiResponse<Consultation>> => {
    const response = await apiClient.put(`/admin/consultations/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/admin/consultations/${id}`);
    return response.data;
  },

  getStats: async (): Promise<ApiResponse<ConsultationStats>> => {
    const response = await apiClient.get('/admin/consultations/stats');
    return response.data;
  },
};

