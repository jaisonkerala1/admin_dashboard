export interface Discussion {
  _id: string;
  
  // Author info (may be null)
  authorId: string | null;
  authorName: string;
  authorPhoto?: string | null;
  authorAvatar?: string | null;
  authorInitial?: string;
  
  // Discussion content
  title: string;
  content: string;
  category: string;
  tags?: string[];
  imageUrl?: string | null;
  attachments?: any[];
  
  // Stats
  likeCount: number;
  commentCount: number;
  shareCount: number;
  viewCount: number;
  saveCount: number;
  
  // Status
  isPublic: boolean;
  visibleTo: string;
  isModerated: boolean;
  moderatedBy?: string | null;
  moderatedAt?: string | null;
  moderationReason?: string | null;
  isDeleted: boolean;
  deletedAt?: string | null;
  isActive: boolean;
  isPinned: boolean;
  
  // Engagement arrays
  likes: any[];
  likesCount: number;
  commentsCount: number;
  visibility: string;
  
  // Trending
  trendingScore: number;
  lastActivityAt: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionStats {
  total: number;
  public: number;
  moderated: number;
  pinned: number;
  totalComments: number;
  totalViews: number;
  totalLikes: number;
}

export interface ModerateDiscussionRequest {
  isModerated?: boolean;
  isPublic?: boolean;
  moderationReason?: string;
}
