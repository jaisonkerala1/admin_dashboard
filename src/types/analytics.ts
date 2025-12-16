export interface AnalyticsOverview {
  revenue: {
    total: number;
    today: number;
    yesterday: number;
    week: number;
    month: number;
    growth: number;
  };
  consultations: {
    total: number;
    today: number;
    completed: number;
    completionRate: string;
  };
  users: {
    total: number;
    active: number;
    activeRate: number | string;
  };
  astrologers: {
    total: number;
    active: number;
    activeRate: string;
  };
  reviews: {
    total: number;
    averageRating: string;
  };
  services: {
    total: number;
  };
  liveStreams: {
    total: number;
    active: number;
  };
}

export interface TrendDataPoint {
  _id: string;
  count?: number;
  revenue?: number;
}

export interface AnalyticsTrends {
  revenue: TrendDataPoint[];
  users: TrendDataPoint[];
  astrologers: TrendDataPoint[];
  consultations: TrendDataPoint[];
}

export interface TopAstrologer {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  specialty?: string;
  totalEarnings: number;
  totalConsultations: number;
}

export interface TopService {
  _id: string;
  bookings: number;
  revenue: number;
}

export interface TopPerformers {
  astrologers: TopAstrologer[];
  services: TopService[];
}

export interface StatusDistribution {
  _id: string;
  count: number;
}

export interface AnalyticsDistributions {
  consultationStatus: StatusDistribution[];
  reviewRatings: StatusDistribution[];
}

export interface LiveStreamStats {
  _id: null | string;
  totalViewers: number;
  totalViews: number;
  avgViewers: number;
  totalLikes: number;
}

export interface AnalyticsData {
  overview: AnalyticsOverview;
  trends: AnalyticsTrends;
  topPerformers: TopPerformers;
  distributions: AnalyticsDistributions;
  liveStreamStats: LiveStreamStats;
}

