export interface Review {
  _id: string;
  
  // Client info (may be null)
  clientId: string | null;
  clientName: string;
  clientAvatar?: string;
  
  // Astrologer reference (may be null)
  astrologerId: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  } | null;
  
  // Review details
  rating: number; // 1-5
  reviewText: string;
  sessionId?: string;
  
  // Astrologer reply
  astrologerReply?: string | null;
  repliedAt?: string | null;
  
  // Moderation
  isPublic: boolean;
  isVerified: boolean;
  isModerated: boolean;
  moderatedBy?: string | null;
  moderatedAt?: string | null;
  
  // Engagement
  helpfulCount: number;
  
  // Meta
  source: string;
  
  // Admin review fields
  isAdminCreated?: boolean;
  createdByAdmin?: string;
  customReviewerName?: string;
  customReviewerAvatar?: string;
  customCreatedAt?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  astrologerId: string;
  rating: number;
  reviewText: string;
  customReviewerName: string;
  customReviewerAvatar?: string;
  customCreatedAt?: string; // ISO date string
}

export interface UpdateReviewRequest {
  rating?: number;
  reviewText?: string;
  customReviewerName?: string;
  customReviewerAvatar?: string;
  customCreatedAt?: string;
}

export interface ReviewStats {
  total: number;
  averageRating: number;
  verified: number;
  moderated: number;
  public: number;
  byRating: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface ModerateReviewRequest {
  isModerated?: boolean;
  isPublic?: boolean;
  moderatedReason?: string;
}
