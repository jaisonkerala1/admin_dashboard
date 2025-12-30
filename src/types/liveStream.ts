export interface LiveStream {
  _id: string;
  
  // Astrologer reference
  astrologerId: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  astrologerName: string;
  astrologerProfilePicture?: string;
  astrologerSpecialty?: string;
  
  // Stream info
  title: string;
  description?: string;
  category: string;
  tags?: string[];
  
  // Agora details
  agoraChannelName: string;
  
  // Status
  isLive: boolean;
  
  // Timestamps
  startedAt?: string;
  endedAt?: string;
  lastHeartbeat?: string;
  
  // Stats
  viewerCount: number;
  peakViewerCount: number;
  totalViews: number;
  likes: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface LiveStreamStats {
  total: number;
  live: number;
  ended: number;
  totalViews: number;
  totalLikes: number;
  peakViewers: number;
}

export interface EndLiveStreamRequest {
  reason?: string;
}

export interface LiveComment {
  _id: string;
  streamId: string;
  userId: string;
  userType: 'Astrologer' | 'User';
  userName: string;
  userAvatar?: string;
  message: string;
  isGift: boolean;
  giftType?: string;
  giftValue?: number;
  createdAt: string;
  updatedAt: string;
}

export interface StreamDetailedStats {
  viewerStats: {
    peak: number;
    total: number;
    current: number;
  };
  engagementStats: {
    likes: number;
    comments: number;
    gifts: number;
    giftValue: number;
  };
  topGifters: Array<{
    _id: string;
    userName: string;
    userAvatar?: string;
    totalValue: number;
    count: number;
  }>;
}
