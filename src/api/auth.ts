import apiClient from './client';
import { LoginRequest, LoginResponse, ApiResponse } from '@/types';

export const authApi = {
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post('/admin/login', data);
    return response.data;
  },
  logout: async (): Promise<ApiResponse<{ loggedOutAt: string }>> => {
    const response = await apiClient.post('/admin/logout');
    return response.data;
  },
};

