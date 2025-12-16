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
