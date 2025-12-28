import { LucideIcon } from 'lucide-react';

export interface AstrologerRanking {
  astrologerId: string;
  name: string;
  email?: string;
  profilePicture?: string;
  // Metrics
  rating: number;
  totalReviews: number;
  experience: number;
  totalConsultations: number;
  trendingScore: number; // calculated
  // Recent activity (for trending)
  recentMessages: number; // last 30 days
  recentCalls: number;
  recentVideoCalls: number;
  recentServiceRequests: number;
  recentConsultations: number;
  // Management
  isPinned: boolean;
  pinnedPosition?: number;
  isHidden: boolean;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
  // Display
  autoRank: number; // system calculated
  liveRank: number; // with manual overrides
  // Additional fields
  specialization?: string[];
  languages?: string[];
  isOnline?: boolean;
  totalEarnings?: number;
}

export type RankingCategoryId = 'top' | 'experienced' | 'popular' | 'trending';

export interface RankingCategory {
  id: RankingCategoryId;
  label: string;
  icon: LucideIcon;
  sortField: keyof AstrologerRanking;
  description: string;
}

export interface CategoryStats {
  totalAstrologers: number;
  averageScore: number;
  pinnedCount: number;
  hiddenCount: number;
  averageRating?: number;
  averageExperience?: number;
  averageConsultations?: number;
}

export interface RankingUpdate {
  astrologerId: string;
  category: RankingCategoryId;
  isPinned?: boolean;
  pinnedPosition?: number;
  isHidden?: boolean;
}

export interface BulkActionRequest {
  action: 'pin' | 'unpin' | 'hide' | 'unhide';
  astrologerIds: string[];
  category: RankingCategoryId;
  pinnedPosition?: number;
}

export interface RankingsResponse {
  success: boolean;
  data: AstrologerRanking[];
  stats: CategoryStats;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

