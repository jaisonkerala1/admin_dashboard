import apiClient from './client';
import {
  Service,
  ServiceStats,
  UpdateServiceRequest,
  PaginationParams,
  ApiResponse,
} from '@/types';

// Custom response type that matches actual backend response
interface ServicesListResponse {
  success: boolean;
  data: Service[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const servicesApi = {
  getAll: async (params?: PaginationParams): Promise<ServicesListResponse> => {
    const response = await apiClient.get('/admin/services', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Service>> => {
    const response = await apiClient.get(`/admin/services/${id}`);
    return response.data;
  },

  update: async (id: string, data: UpdateServiceRequest): Promise<ApiResponse<Service>> => {
    const response = await apiClient.put(`/admin/services/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/admin/services/${id}`);
    return response.data;
  },

  getStats: async (): Promise<ApiResponse<ServiceStats>> => {
    const response = await apiClient.get('/admin/services/stats');
    return response.data;
  },
};

