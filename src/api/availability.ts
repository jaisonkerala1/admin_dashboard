import apiClient from './client';
import type {
  Availability,
  AvailabilityApiResponse,
  AstrologerAvailabilitySummary,
  Holiday,
} from '@/types';

// Real backend integration (Admin APIs)
// BaseURL already includes "/api" (see src/utils/constants.ts)
// Admin auth header x-admin-key is injected by apiClient interceptor (see src/api/client.ts)

type CreateAvailabilityInput = Omit<Availability, '_id' | 'createdAt' | 'updatedAt'>;
type UpdateAvailabilityInput = Partial<Omit<Availability, '_id' | 'createdAt' | 'updatedAt'>> & { _id: string };
type CreateHolidayInput = Omit<Holiday, '_id' | 'createdAt'>;

export const availabilityApi = {
  async getAllAstrologersAvailability(dateYmd?: string): Promise<AvailabilityApiResponse<AstrologerAvailabilitySummary[]>> {
    const response = await apiClient.get('/admin/calendar/availability/all', {
      params: dateYmd ? { date: dateYmd } : undefined,
    });
    return response.data;
  },

  async getAstrologerAvailability(astrologerId: string): Promise<AvailabilityApiResponse<Availability[]>> {
    const response = await apiClient.get(`/admin/calendar/availability/${astrologerId}`);
    // backend returns { availability, holidays } inside data
    const data = response.data?.data?.availability || [];
    return { success: true, data };
  },

  async getAllHolidays(): Promise<AvailabilityApiResponse<Holiday[]>> {
    const response = await apiClient.get('/admin/calendar/holidays/all');
    return response.data;
  },

  async getAstrologerHolidays(astrologerId: string): Promise<AvailabilityApiResponse<Holiday[]>> {
    const response = await apiClient.get(`/admin/calendar/holidays/${astrologerId}`);
    return response.data;
  },

  async createAvailability(input: CreateAvailabilityInput): Promise<AvailabilityApiResponse<Availability>> {
    const response = await apiClient.post('/admin/calendar/availability', input);
    return response.data;
  },

  async updateAvailability(input: UpdateAvailabilityInput): Promise<AvailabilityApiResponse<Availability>> {
    const { _id, ...patch } = input;
    const response = await apiClient.put(`/admin/calendar/availability/${_id}`, patch);
    return response.data;
  },

  async deleteAvailability(id: string): Promise<AvailabilityApiResponse<{ id: string }>> {
    const response = await apiClient.delete(`/admin/calendar/availability/${id}`);
    return response.data;
  },

  async createHoliday(input: CreateHolidayInput): Promise<AvailabilityApiResponse<Holiday>> {
    const response = await apiClient.post('/admin/calendar/holidays', input);
    return response.data;
  },

  async deleteHoliday(id: string): Promise<AvailabilityApiResponse<{ id: string }>> {
    const response = await apiClient.delete(`/admin/calendar/holidays/${id}`);
    return response.data;
  },
};


