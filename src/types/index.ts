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
  totalAstrologers: number;
  activeAstrologers: number;
  pendingApprovals: number;
  suspendedAstrologers: number;
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  totalConsultations: number;
  ongoingConsultations: number;
  completedConsultations: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalServices: number;
  activeServices: number;
  pendingServices: number;
  totalReviews: number;
  activeLiveStreams: number;
  totalDiscussions: number;
}

export * from './astrologer';
export * from './user';
export * from './consultation';
export * from './service';
export * from './review';
export * from './liveStream';
export * from './discussion';

