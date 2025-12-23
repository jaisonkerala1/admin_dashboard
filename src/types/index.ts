// Common types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Auth types
export interface AdminAuthState {
  isAuthenticated: boolean;
  adminKey: string | null;
  login: (key: string) => Promise<void>;
  logout: () => void;
}

export interface LoginRequest {
  adminKey: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
}

// Dashboard types
export interface DashboardStats {
  astrologers: {
    total: number;
    active: number;
    pendingApprovals: number;
    suspended: number;
    online: number;
  };
  users: {
    total: number;
    active: number;
    banned: number;
  };
  consultations: {
    total: number;
    completed: number;
    ongoing: number;
  };
  revenue: {
    total: number;
    monthly: number;
  };
  liveStreams: {
    active: number;
  };
  reviews: {
    total: number;
  };
  services: {
    total: number;
    active: number;
    pending: number;
  };
  discussions: {
    total: number;
  };
}

export * from './astrologer';
export * from './user';
export * from './earnings';
export * from './availability';
export * from './ticket';
export * from './consultation';
export * from './service';
export * from './review';
export * from './liveStream';
export * from './discussion';
export * from './poojaRequest';
export * from './analytics';
export * from './communication';
export * from './approval';

