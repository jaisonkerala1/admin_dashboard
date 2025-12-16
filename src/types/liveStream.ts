export interface LiveStream {
  _id: string;
  astrologerId: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  title: string;
  description?: string;
  scheduledAt: string;
  startedAt?: string;
  endedAt?: string;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  streamUrl?: string;
  thumbnailUrl?: string;
  viewerCount: number;
  totalViewers: number;
  peakViewers: number;
  duration?: number;
  earnings: number;
  tags?: string[];
  isRecorded: boolean;
  recordingUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LiveStreamStats {
  total: number;
  live: number;
  scheduled: number;
  totalViewers: number;
  totalEarnings: number;
  averageDuration: number;
}

export interface EndLiveStreamRequest {
  reason?: string;
}

