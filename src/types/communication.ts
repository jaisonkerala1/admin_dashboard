export interface DirectMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  senderType: 'user' | 'astrologer' | 'admin';
  senderName?: string;
  senderAvatar?: string;
  recipientId: string;
  recipientType: 'user' | 'astrologer' | 'admin';
  content: string;
  messageType: 'text' | 'image' | 'audio' | 'file' | 'call_log';
  mediaUrl?: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  readAt?: Date;
  replyToId?: string;
  // Call log specific fields
  callType?: 'voice' | 'video';
  callStatus?: 'completed' | 'missed' | 'declined' | 'cancelled';
  callDuration?: number; // in seconds
  callId?: string;
}

export interface DirectConversation {
  _id: string;
  participants: Array<{
    id: string;
    type: 'User' | 'Astrologer' | 'Admin';
  }>;
  lastMessage?: string;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Call {
  _id: string;
  callerId: string;
  callerType: 'user' | 'astrologer' | 'admin';
  recipientId: string;
  recipientType: 'user' | 'astrologer' | 'admin';
  callType: 'voice' | 'video';
  channelName: string;
  agoraToken?: string;
  status: 'initiated' | 'ringing' | 'accepted' | 'rejected' | 'connected' | 'ended' | 'missed';
  startedAt: Date;
  acceptedAt?: Date;
  connectedAt?: Date;
  endedAt?: Date;
  duration?: number;
  endReason?: string;
}
