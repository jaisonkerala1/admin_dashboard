import { io, Socket } from 'socket.io-client';
import type { DirectMessage } from '@/types/communication';
import { SOCKET_URL, ADMIN_SECRET_KEY } from '@/utils/constants';

class SocketService {
  private socket: Socket | null = null;
  private connectionPromise: Promise<void> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private messageCallbacks: Array<(message: DirectMessage) => void> = [];
  private callAcceptCallbacks: Array<(data: { callId: string; contactId?: string; agoraToken?: string; channelName?: string; agoraAppId?: string }) => void> = [];
  private callEndCallbacks: Array<(callId: string) => void> = [];
  private callTokenCallbacks: Array<(data: any) => void> = [];
  private callIncomingCallbacks: Array<(call: any) => void> = [];
  private typingCallbacks: Array<(data: { conversationId: string; userId: string; isTyping: boolean }) => void> = [];
  private ticketCallbacks: Array<(ticket: any) => void> = [];
  private ticketMessageCallbacks: Array<(message: any) => void> = [];
  private ticketStatusCallbacks: Array<(data: any) => void> = [];
  private ticketAssignCallbacks: Array<(data: any) => void> = [];
  private ticketPriorityCallbacks: Array<(data: any) => void> = [];
  private astrologerStatusCallbacks: Array<(data: { astrologerId: string; isOnline: boolean; lastSeen: string }) => void> = [];
  private liveCommentCallbacks: Array<(comment: any) => void> = [];
  private liveGiftCallbacks: Array<(gift: any) => void> = [];
  private liveLikeCallbacks: Array<(data: { streamId: string; count: number }) => void> = [];
  private liveViewerCallbacks: Array<(data: { streamId: string; count: number }) => void> = [];
  private liveEndCallbacks: Array<(data: { streamId: string; message: string }) => void> = [];
  private liveStartCallbacks: Array<(stream: any) => void> = [];
  private liveGlobalEndCallbacks: Array<(data: { streamId: string }) => void> = [];

  connect() {
    if (this.socket?.connected) {
      console.log('✅ Socket already connected');
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token: ADMIN_SECRET_KEY,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventListeners();
  }

  /**
   * Ensure the socket is connected before sending/receiving events.
   * Resolves once the socket is connected, with a small timeout to avoid hanging spinners.
   */
  async connectAndWait(timeoutMs: number = 3000): Promise<void> {
    if (this.socket?.connected) {
      return;
    }

    // If a connection attempt is already in-flight, reuse it
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connect();

    this.connectionPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.connectionPromise = null;
        reject(new Error('Socket connection timeout'));
      }, timeoutMs);

      this.socket?.once('connect', () => {
        clearTimeout(timeout);
        this.connectionPromise = null;
        resolve();
      });

      this.socket?.once('connect_error', (err) => {
        clearTimeout(timeout);
        this.connectionPromise = null;
        reject(err);
      });
    });

    return this.connectionPromise;
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ [SOCKET] Connected to server');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ [SOCKET] Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ [SOCKET] Connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('❌ [SOCKET] Max reconnection attempts reached');
      }
    });

    // Message events
    this.socket.on('dm:message_received', (message: DirectMessage) => {
      console.log('📩 [SOCKET] Message received:', message);
      this.messageCallbacks.forEach(callback => callback(message));
    });

    this.socket.on('dm:message_sent', (message: DirectMessage) => {
      console.log('✅ [SOCKET] Message sent:', message);
      this.messageCallbacks.forEach(callback => callback(message));
    });

    // Lightweight notification event emitted to recipient personal room
    // (works even when admin hasn't joined the conversation room)
    this.socket.on('dm:new_message', (payload: any) => {
      try {
        const normalized: DirectMessage = {
          _id: (payload?._id ?? `preview_${Date.now()}`).toString(),
          id: (payload?.id ?? payload?._id ?? `preview_${Date.now()}`).toString(),
          conversationId: payload?.conversationId ?? '',
          senderId: payload?.senderId ?? '',
          senderType: payload?.senderType ?? 'user',
          senderName: payload?.senderName,
          senderAvatar: payload?.senderAvatar,
          recipientId: 'admin',
          recipientType: 'admin',
          content: payload?.content ?? '',
          messageType: 'text',
          timestamp: payload?.timestamp ? new Date(payload.timestamp) : new Date(),
          status: 'delivered',
        };
        console.log('📩 [SOCKET] New message (preview):', normalized);
        this.messageCallbacks.forEach(callback => callback(normalized));
      } catch (e) {
        console.warn('⚠️ [SOCKET] Failed to normalize dm:new_message payload:', e);
      }
    });

    // Typing events
    this.socket.on('dm:user_typing', (data: { conversationId: string; userId: string; userType: string }) => {
      console.log('⌨️ [SOCKET] User typing:', data);
      this.typingCallbacks.forEach(callback => callback({ ...data, isTyping: true }));
    });

    this.socket.on('dm:user_stopped_typing', (data: { conversationId: string; userId: string; userType: string }) => {
      console.log('⌨️ [SOCKET] User stopped typing:', data);
      this.typingCallbacks.forEach(callback => callback({ ...data, isTyping: false }));
    });

    // Call events
    this.socket.on('call:incoming', (call: any) => {
      console.log('📞 [SOCKET] Incoming call:', call);
      this.callIncomingCallbacks.forEach(callback => callback(call));
    });

    this.socket.on('call:token', (data: any) => {
      console.log('🔑 [SOCKET] Call token received:', data);
      this.callTokenCallbacks.forEach(callback => callback(data));
    });

    // Call accepted (server -> caller). Backend event is `call:accept`.
    // Keep backward compatibility in case older servers emit `call:accepted`.
    const handleCallAccept = (data: any) => {
      console.log('✅ [SOCKET] Call accepted:', data);
      const normalized = {
        callId: data?.callId ?? data?._id,
        contactId: data?.contactId,
        agoraToken: data?.agoraToken,
        channelName: data?.channelName,
        agoraAppId: data?.agoraAppId,
      };
      if (!normalized.callId) return;
      this.callAcceptCallbacks.forEach(callback => callback(normalized));
    };
    this.socket.on('call:accept', handleCallAccept);
    this.socket.on('call:accepted', handleCallAccept);

    this.socket.on('call:reject', (data: { callId: string; reason?: string }) => {
      console.log('❌ [SOCKET] Call rejected:', data);
      this.callEndCallbacks.forEach(callback => callback(data.callId));
    });

    // Call ended (server -> other party). Backend event is `call:end`.
    // Keep backward compatibility in case older servers emit `call:ended`.
    const handleCallEnd = (data: any) => {
      console.log('📞 [SOCKET] Call ended:', data);
      const callId = data?.callId ?? data?._id;
      if (!callId) return;
      this.callEndCallbacks.forEach(callback => callback(callId));
    };
    this.socket.on('call:end', handleCallEnd);
    this.socket.on('call:ended', handleCallEnd);

    this.socket.on('call:missed', (data: { callId: string }) => {
      console.log('📞 [SOCKET] Call missed:', data);
      this.callEndCallbacks.forEach(callback => callback(data.callId));
    });

    // Ticket events
    this.socket.on('ticket:new_ticket', (ticket: any) => {
      console.log('🎫 [SOCKET] New ticket created:', ticket);
      this.ticketCallbacks.forEach(callback => callback(ticket));
    });

    this.socket.on('ticket:new_message', (message: any) => {
      console.log('💬 [SOCKET] New ticket message:', message);
      this.ticketMessageCallbacks.forEach(callback => callback(message));
    });

    this.socket.on('ticket:status_changed', (data: any) => {
      console.log('📋 [SOCKET] Ticket status changed:', data);
      this.ticketStatusCallbacks.forEach(callback => callback(data));
    });

    this.socket.on('ticket:assigned', (data: any) => {
      console.log('👤 [SOCKET] Ticket assigned:', data);
      this.ticketAssignCallbacks.forEach(callback => callback(data));
    });

    this.socket.on('ticket:priority_changed', (data: any) => {
      console.log('⚠️ [SOCKET] Ticket priority changed:', data);
      this.ticketPriorityCallbacks.forEach(callback => callback(data));
    });

    // Astrologer status change events
    this.socket.on('astrologer:status_changed', (data: { astrologerId: string; isOnline: boolean; lastSeen: string; name?: string; profilePicture?: string }) => {
      console.log('👤 [SOCKET] Astrologer status changed:', data);
      this.astrologerStatusCallbacks.forEach(callback => callback(data));
    });

    // Live stream events
    this.socket.on('live:comment', (comment: any) => {
      console.log('💬 [SOCKET] Live comment:', comment);
      this.liveCommentCallbacks.forEach(callback => callback(comment));
    });

    this.socket.on('live:gift', (gift: any) => {
      console.log('🎁 [SOCKET] Live gift:', gift);
      this.liveGiftCallbacks.forEach(callback => callback(gift));
    });

    this.socket.on('live:like_count', (data: { streamId: string; count: number }) => {
      console.log('👍 [SOCKET] Live like count:', data);
      this.liveLikeCallbacks.forEach(callback => callback(data));
    });

    this.socket.on('live:viewer_count', (data: { streamId: string; count: number }) => {
      console.log('👁️ [SOCKET] Live viewer count:', data);
      this.liveViewerCallbacks.forEach(callback => callback(data));
    });

    this.socket.on('live:end', (data: { streamId: string; message: string }) => {
      console.log('🛑 [SOCKET] Live stream ended:', data);
      this.liveEndCallbacks.forEach(callback => callback(data));
    });

    // Global live stream events
    this.socket.on('live:stream_started', (stream: any) => {
      console.log('🔴 [SOCKET] Global: Stream started:', stream);
      this.liveStartCallbacks.forEach(callback => callback(stream));
    });

    this.socket.on('live:stream_ended', (data: { streamId: string }) => {
      console.log('⬛ [SOCKET] Global: Stream ended:', data);
      this.liveGlobalEndCallbacks.forEach(callback => callback(data));
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('👋 [SOCKET] Disconnected');
    }
  }

  // Messaging methods
  joinConversation(conversationId: string) {
    if (!this.socket?.connected) {
      console.error('❌ Socket not connected');
      return;
    }

    this.socket.emit('dm:join_conversation', {
      conversationId,
      userId: 'admin',
      userType: 'admin',
    });
    console.log(`🚪 [SOCKET] Joined conversation: ${conversationId}`);
  }

  leaveConversation(conversationId: string) {
    if (!this.socket?.connected) return;

    this.socket.emit('dm:leave_conversation', {
      conversationId,
      userId: 'admin',
      userType: 'admin',
    });
    console.log(`🚪 [SOCKET] Left conversation: ${conversationId}`);
  }

  sendMessage(data: {
    conversationId: string;
    recipientId: string;
    recipientType: 'astrologer' | 'user';
    content: string;
    messageType?: 'text' | 'image' | 'audio' | 'file';
    mediaUrl?: string;
  }) {
    if (!this.socket?.connected) {
      console.error('❌ Socket not connected');
      return;
    }

    this.socket.emit('dm:send_message', {
      ...data,
      messageType: data.messageType || 'text',
    });
    console.log('📤 [SOCKET] Sending message:', data);
  }

  markAsRead(conversationId: string, messageIds: string[]) {
    if (!this.socket?.connected) return;

    this.socket.emit('dm:mark_read', {
      conversationId,
      messageIds,
      userId: 'admin',
      userType: 'admin',
    });
  }

  startTyping(conversationId: string) {
    if (!this.socket?.connected) return;

    this.socket.emit('dm:typing_start', {
      conversationId,
      userId: 'admin',
      userType: 'admin',
    });
  }

  stopTyping(conversationId: string) {
    if (!this.socket?.connected) return;

    this.socket.emit('dm:typing_stop', {
      conversationId,
      userId: 'admin',
      userType: 'admin',
    });
  }

  async getMessageHistory(
    conversationId: string,
    page: number = 1,
    limit: number = 50,
    callback: (messages: DirectMessage[]) => void
  ): Promise<void> {
    try {
      await this.connectAndWait();
    } catch (err) {
      console.error('❌ Socket not connected (history):', err);
      callback([]);
      return;
    }

    // Prepare response handler before emitting to avoid race conditions
    const socket = this.socket;
    if (!socket) {
      console.error('❌ Socket missing after connect for history');
      callback([]);
      return;
    }

    const handler = (data: { conversationId: string; messages: DirectMessage[] }) => {
      if (data.conversationId !== conversationId) return;
      clearTimeout(timeoutId);
      socket.off('dm:history_response', handler);
      socket.off('dm:history', handler);
      console.log(`📜 [SOCKET] History received for ${conversationId}: ${data.messages?.length ?? 0} messages`);
      callback(data.messages);
    };

    // Failsafe timeout: stop loading even if server reply is lost
    const timeoutId = setTimeout(() => {
      socket.off('dm:history_response', handler);
      socket.off('dm:history', handler);
      console.warn(`⚠️ [SOCKET] History response timeout for ${conversationId}`);
      callback([]);
    }, 4000);

    // Listen to both names to be resilient to backend emission differences
    socket.on('dm:history_response', handler);
    socket.on('dm:history', handler);

    socket.emit('dm:history', {
      conversationId,
      page,
      limit,
    });
  }

  // Call methods
  initiateCall(data: {
    recipientId: string;
    recipientType: 'astrologer' | 'user';
    callType: 'voice' | 'video';
  }) {
    if (!this.socket?.connected) {
      console.error('❌ Socket not connected');
      return;
    }

    this.socket.emit('call:initiate', {
      ...data,
      callerId: 'admin',
      callerType: 'admin',
    });
    console.log('📞 [SOCKET] Initiating call:', data);
  }

  acceptCall(callId: string, contactId?: string) {
    if (!this.socket?.connected) return;

    this.socket.emit('call:accept', { callId, contactId });
    console.log('✅ [SOCKET] Accepting call:', callId);
  }

  rejectCall(callId: string, reason?: string) {
    if (!this.socket?.connected) return;

    this.socket.emit('call:reject', { callId, reason });
    console.log('❌ [SOCKET] Rejecting call:', callId);
  }

  endCall(callId: string, options?: { contactId?: string; duration?: number; endReason?: string }) {
    if (!this.socket?.connected) return;

    const payload: Record<string, any> = { callId };
    if (options?.contactId) payload.contactId = options.contactId;
    if (options?.duration !== undefined) payload.duration = options.duration;
    if (options?.endReason) payload.reason = options.endReason;

    this.socket.emit('call:end', payload);
    console.log('📞 [SOCKET] Ending call:', callId, options ? `(contactId: ${options.contactId}, duration: ${options.duration}s)` : '');
  }

  notifyCallConnected(callId: string) {
    if (!this.socket?.connected) return;

    this.socket.emit('call:connected', { callId });
  }

  // Event listeners
  onMessage(callback: (message: DirectMessage) => void) {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    };
  }

  onCallAccept(callback: (data: { callId: string; contactId?: string; agoraToken?: string; channelName?: string; agoraAppId?: string }) => void) {
    this.callAcceptCallbacks.push(callback);
    return () => {
      this.callAcceptCallbacks = this.callAcceptCallbacks.filter(cb => cb !== callback);
    };
  }

  onCallEnd(callback: (callId: string) => void) {
    this.callEndCallbacks.push(callback);
    return () => {
      this.callEndCallbacks = this.callEndCallbacks.filter(cb => cb !== callback);
    };
  }

  onTyping(callback: (data: { conversationId: string; userId: string; isTyping: boolean }) => void) {
    this.typingCallbacks.push(callback);
    return () => {
      this.typingCallbacks = this.typingCallbacks.filter(cb => cb !== callback);
    };
  }

  onCallToken(callback: (data: any) => void) {
    this.callTokenCallbacks.push(callback);
    return () => {
      this.callTokenCallbacks = this.callTokenCallbacks.filter(cb => cb !== callback);
    };
  }

  onIncomingCall(callback: (call: any) => void) {
    this.callIncomingCallbacks.push(callback);
    return () => {
      this.callIncomingCallbacks = this.callIncomingCallbacks.filter(cb => cb !== callback);
    };
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Ticket methods
  joinTicketMonitor() {
    if (!this.socket?.connected) {
      console.error('❌ Socket not connected');
      return;
    }

    this.socket.emit('admin_join_ticket_monitor');
    console.log('🎫 [SOCKET] Joined ticket monitor');
  }

  joinTicket(ticketId: string) {
    if (!this.socket?.connected) {
      console.error('❌ Socket not connected');
      return;
    }

    this.socket.emit('join_ticket', { ticketId });
    console.log(`🎫 [SOCKET] Joined ticket: ${ticketId}`);
  }

  leaveTicket(ticketId: string) {
    if (!this.socket?.connected) return;

    this.socket.emit('leave_ticket', { ticketId });
    console.log(`🎫 [SOCKET] Left ticket: ${ticketId}`);
  }

  // Live Stream methods
  joinLiveStream(streamId: string) {
    if (!this.socket?.connected) {
      console.error('❌ Socket not connected');
      return;
    }

    this.socket.emit('live:join', {
      streamId,
      isBroadcaster: false,
    });
    console.log(`📺 [SOCKET] Joined live stream: ${streamId}`);
  }

  leaveLiveStream(streamId: string) {
    if (!this.socket?.connected) return;

    this.socket.emit('live:leave', { streamId });
    console.log(`📺 [SOCKET] Left live stream: ${streamId}`);
  }

  sendTicketTyping(ticketId: string, isTyping: boolean) {
    if (!this.socket?.connected) return;

    this.socket.emit('ticket:typing', { ticketId, isTyping });
  }

  // Ticket event listeners
  onNewTicket(callback: (ticket: any) => void) {
    this.ticketCallbacks.push(callback);
    return () => {
      this.ticketCallbacks = this.ticketCallbacks.filter(cb => cb !== callback);
    };
  }

  onTicketMessage(callback: (message: any) => void) {
    this.ticketMessageCallbacks.push(callback);
    return () => {
      this.ticketMessageCallbacks = this.ticketMessageCallbacks.filter(cb => cb !== callback);
    };
  }

  onTicketStatusChange(callback: (data: any) => void) {
    this.ticketStatusCallbacks.push(callback);
    return () => {
      this.ticketStatusCallbacks = this.ticketStatusCallbacks.filter(cb => cb !== callback);
    };
  }

  onTicketAssign(callback: (data: any) => void) {
    this.ticketAssignCallbacks.push(callback);
    return () => {
      this.ticketAssignCallbacks = this.ticketAssignCallbacks.filter(cb => cb !== callback);
    };
  }

  onTicketPriorityChange(callback: (data: any) => void) {
    this.ticketPriorityCallbacks.push(callback);
    return () => {
      this.ticketPriorityCallbacks = this.ticketPriorityCallbacks.filter(cb => cb !== callback);
    };
  }

  // Astrologer status event listener
  onAstrologerStatusChange(callback: (data: { astrologerId: string; isOnline: boolean; lastSeen: string }) => void) {
    this.astrologerStatusCallbacks.push(callback);
    return () => {
      this.astrologerStatusCallbacks = this.astrologerStatusCallbacks.filter(cb => cb !== callback);
    };
  }

  // Live Stream event listeners
  onLiveComment(callback: (comment: any) => void) {
    this.liveCommentCallbacks.push(callback);
    return () => {
      this.liveCommentCallbacks = this.liveCommentCallbacks.filter(cb => cb !== callback);
    };
  }

  onLiveGift(callback: (gift: any) => void) {
    this.liveGiftCallbacks.push(callback);
    return () => {
      this.liveGiftCallbacks = this.liveGiftCallbacks.filter(cb => cb !== callback);
    };
  }

  onLiveLikeCount(callback: (data: { streamId: string; count: number }) => void) {
    this.liveLikeCallbacks.push(callback);
    return () => {
      this.liveLikeCallbacks = this.liveLikeCallbacks.filter(cb => cb !== callback);
    };
  }

  onLiveViewerCount(callback: (data: { streamId: string; count: number }) => void) {
    this.liveViewerCallbacks.push(callback);
    return () => {
      this.liveViewerCallbacks = this.liveViewerCallbacks.filter(cb => cb !== callback);
    };
  }

  onLiveEnd(callback: (data: { streamId: string; message: string }) => void) {
    this.liveEndCallbacks.push(callback);
    return () => {
      this.liveEndCallbacks = this.liveEndCallbacks.filter(cb => cb !== callback);
    };
  }

  onStreamStarted(callback: (stream: any) => void) {
    this.liveStartCallbacks.push(callback);
    return () => {
      this.liveStartCallbacks = this.liveStartCallbacks.filter(cb => cb !== callback);
    };
  }

  onStreamEnded(callback: (data: { streamId: string }) => void) {
    this.liveGlobalEndCallbacks.push(callback);
    return () => {
      this.liveGlobalEndCallbacks = this.liveGlobalEndCallbacks.filter(cb => cb !== callback);
    };
  }
}

export const socketService = new SocketService();


