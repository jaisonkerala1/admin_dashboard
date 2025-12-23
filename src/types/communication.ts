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

// DirectMessage type for chat messages
export interface DirectMessage {
  _id?: string;
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'user' | 'astrologer' | 'admin';
  senderName?: string;
  senderAvatar?: string;
  recipientId: string;
  recipientType: 'user' | 'astrologer' | 'admin';
  content: string;
  messageType: 'text' | 'image' | 'audio' | 'video' | 'file' | 'call_log';
  mediaUrl?: string;
  timestamp: Date | string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  callType?: 'voice' | 'video';
  callStatus?: 'completed' | 'missed' | 'declined' | 'cancelled';
  callDuration?: number; // in seconds
}

// Call type for voice/video calls
export interface Call {
  _id?: string;
  id?: string;
  callerId: string;
  callerType: 'user' | 'astrologer' | 'admin';
  callerName?: string;
  callerAvatar?: string;
  recipientId: string;
  recipientType: 'user' | 'astrologer' | 'admin';
  recipientName?: string;
  recipientAvatar?: string;
  callType: 'voice' | 'video';
  channelName: string;
  agoraToken?: string;
  status: 'initiated' | 'ringing' | 'accepted' | 'rejected' | 'connected' | 'ended' | 'missed' | 'failed' | 'cancelled';
  duration?: number; // in seconds
  startTime?: Date | string;
  startedAt?: Date;
  endTime?: Date | string;
}
