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
