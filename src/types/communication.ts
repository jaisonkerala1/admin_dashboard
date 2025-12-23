// Communication Analytics Types

export type CommunicationPeriod = '1d' | '7d' | '30d' | '90d' | '1y';

export interface CommunicationStats {
  totalMessages: number;
  totalVoiceCalls: number;
  totalVideoCalls: number;
  totalCommunications: number;
  avgCallDuration: number; // in minutes
  activeConversations: number;
  completedCalls: number;
  missedCalls: number;
  rejectedCalls: number;
}

export interface CommunicationTrend {
  date: string;
  messages: number;
  voiceCalls: number;
  videoCalls: number;
  total: number;
}

export interface AstrologerCommunicationStats {
  astrologerId: string;
  astrologerName: string;
  messages: number;
  voiceCalls: number;
  videoCalls: number;
  total: number;
}

export interface CallDurationStats {
  astrologerId: string;
  astrologerName: string;
  avgVoiceCallDuration: number; // in minutes
  avgVideoCallDuration: number; // in minutes
  totalVoiceCalls: number;
  totalVideoCalls: number;
}

export interface PeakHoursData {
  hour: number; // 0-23
  messages: number;
  voiceCalls: number;
  videoCalls: number;
  total: number;
}

export interface CallSuccessRateTrend {
  date: string;
  completedRate: number; // percentage
  missedRate: number; // percentage
  rejectedRate: number; // percentage
}
