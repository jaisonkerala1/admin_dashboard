export interface CommunicationTrendPoint {
  date: string;
  messages: number;
  voice: number;
  video: number;
}

export interface CommunicationAnalytics {
  trends: CommunicationTrendPoint[];
  summary: {
    totalMessages: number;
    totalVoice: number;
    totalVideo: number;
  };
}

export interface AnalyticsOverview {
  revenue: {
    total: number;
    month: number;
    week: number;
    growth: number;
  };
  consultations: {
    total: number;
    completionRate: number;
  };
  astrologers: {
    total: number;
    activeRate: number;
  };
  reviews: {
    total: number;
    averageRating: number;
  };
  users: {
    total: number;
    active: number;
  };
  services: {
    total: number;
  };
  liveStreams: {
    total: number;
    active: number;
  };
}

export interface AnalyticsTrend {
  _id: string;
  count: number;
  revenue?: number;
}

export interface AnalyticsTopAstrologer {
  _id: string;
  name: string;
  profilePicture: string;
  specialty: string;
  totalEarnings: number;
  totalConsultations: number;
}

export interface AnalyticsTopService {
  _id: string;
  bookings: number;
  revenue: number;
}

export interface AnalyticsData {
  overview: AnalyticsOverview;
  trends: {
    revenue: AnalyticsTrend[];
    consultations: AnalyticsTrend[];
    users: AnalyticsTrend[];
    astrologers: AnalyticsTrend[];
  };
  topPerformers: {
    astrologers: AnalyticsTopAstrologer[];
    services: AnalyticsTopService[];
  };
  distributions: {
    consultationStatus: { _id: string; count: number }[];
    reviewRatings: { _id: number; count: number }[];
  };
}
