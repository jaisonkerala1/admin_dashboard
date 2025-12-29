import apiClient from './client';
import { ApiResponse, Astrologer, Consultation, Service, PoojaRequest } from '@/types';

export interface GlobalSearchResult {
  astrologers: Astrologer[];
  consultations: Consultation[];
  services: Service[];
  serviceRequests: PoojaRequest[];
  recentSearches?: string[];
}

export interface SearchResponse extends ApiResponse {
  data: GlobalSearchResult;
  totalResults: number;
  searchTime?: number;
}

export const searchApi = {
  globalSearch: async (query: string, limit = 5): Promise<SearchResponse> => {
    const response = await apiClient.get('/admin/search', { 
      params: { q: query, limit, includeRecent: true } 
    });
    return response.data;
  },
  
  saveRecentSearch: async (query: string): Promise<ApiResponse> => {
    const response = await apiClient.post('/admin/search/recent', { query });
    return response.data;
  },
  
  clearRecentSearches: async (): Promise<ApiResponse> => {
    const response = await apiClient.delete('/admin/search/recent');
    return response.data;
  }
};

