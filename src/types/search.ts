import { Astrologer, Consultation, Service, PoojaRequest } from './index';

export type SearchResultType = 'astrologer' | 'consultation' | 'service' | 'serviceRequest';

export interface SearchResultItem {
  _id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  status?: string;
  metadata?: Record<string, any>;
}

export interface GlobalSearchResult {
  astrologers: Astrologer[];
  consultations: Consultation[];
  services: Service[];
  serviceRequests: PoojaRequest[];
  recentSearches?: string[];
}

export interface SearchHighlight {
  field: string;
  matches: Array<{ start: number; end: number }>;
}

