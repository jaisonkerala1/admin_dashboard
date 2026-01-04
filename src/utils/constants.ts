export const APP_NAME = 'Astrologer Platform Admin';

// Backend base URL
export const BACKEND_URL = 'https://astrologerapp-production.up.railway.app';

// API base URL - use Railway backend in production, proxy in development
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://astrologerapp-production.up.railway.app/api'
    : '/api');

export const ADMIN_SECRET_KEY = import.meta.env.VITE_ADMIN_SECRET_KEY || 'admin123';

// Socket.IO URL - always use Railway backend
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://astrologerapp-production.up.railway.app';

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  ASTROLOGERS: '/astrologers',
  ASTROLOGER_DETAIL: '/astrologers/:id',
  ASTROLOGER_APPROVALS: '/astrologers/pending-approvals',
  USERS: '/users',
  USER_DETAIL: '/users/:id',
  CONSULTATIONS: '/consultations',
  CONSULTATION_DETAIL: '/consultations/:id',
  CALENDAR: '/calendar',
  SERVICES: '/services',
  SERVICE_DETAIL: '/services/:id',
  SERVICE_REQUESTS: '/service-requests',
  REVIEWS: '/reviews',
  LIVE_STREAMS: '/live-streams',
  DISCUSSIONS: '/discussions',
  ANALYTICS: '/analytics',
  COMMUNICATION: '/communication',
  COMMUNICATION_ANALYTICS: '/communication-analytics',
  EARNINGS: '/earnings',
  WALLET: '/wallet',
  SUPPORT: '/support',
  APPROVALS: '/approvals',
  NOTIFICATIONS: '/notifications',
  RANKINGS: '/rankings',
  SEARCH: '/search',
  AD_CENTRE: '/ad-centre',
  SETTINGS: '/settings',
} as const;

export const ASTROLOGER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  SUSPENDED: 'suspended',
  REJECTED: 'rejected',
} as const;

export const USER_STATUS = {
  ACTIVE: 'active',
  BANNED: 'banned',
  INACTIVE: 'inactive',
} as const;

export const CONSULTATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
} as const;

export const SERVICE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export const SERVICE_REQUEST_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'inProgress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const LIVE_STREAM_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  ENDED: 'ended',
  CANCELLED: 'cancelled',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  LIMIT_OPTIONS: [10, 20, 50, 100],
} as const;

