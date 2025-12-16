import apiClient from './client';
import {
  PoojaRequest,
  UpdatePoojaRequestRequest,
  PaginationParams,
  ApiResponse,
} from '@/types';

// Custom response type that matches backend
interface PoojaRequestsListResponse {
  success: boolean;
  data: PoojaRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const poojaRequestsApi = {
  getAll: async (params?: PaginationParams): Promise<PoojaRequestsListResponse> => {
    const response = await apiClient.get('/admin/service-requests', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<PoojaRequest>> => {
    const response = await apiClient.get(`/admin/service-requests/${id}`);
    return response.data;
  },

  update: async (id: string, data: UpdatePoojaRequestRequest): Promise<ApiResponse<PoojaRequest>> => {
    const response = await apiClient.put(`/admin/service-requests/${id}`, data);
    return response.data;
  },
};

