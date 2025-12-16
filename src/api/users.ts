import apiClient from './client';
import {
  User,
  UserStats,
  BanUserRequest,
  UpdateUserRequest,
  PaginatedResponse,
  PaginationParams,
  ApiResponse,
} from '@/types';

export const usersApi = {
  getAll: async (params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<User>>> => {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<User>> => {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data;
  },

  update: async (id: string, data: UpdateUserRequest): Promise<ApiResponse<User>> => {
    const response = await apiClient.put(`/admin/users/${id}`, data);
    return response.data;
  },

  ban: async (id: string, data: BanUserRequest): Promise<ApiResponse<User>> => {
    const response = await apiClient.patch(`/admin/users/${id}/ban`, data);
    return response.data;
  },

  unban: async (id: string): Promise<ApiResponse<User>> => {
    const response = await apiClient.patch(`/admin/users/${id}/unban`);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/admin/users/${id}`);
    return response.data;
  },

  getStats: async (id: string): Promise<ApiResponse<UserStats>> => {
    const response = await apiClient.get(`/admin/users/${id}/stats`);
    return response.data;
  },
};

