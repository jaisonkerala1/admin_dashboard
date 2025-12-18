import { io, Socket } from 'socket.io-client';
import type { DirectMessage, Call } from '@/types/communication';
import { SOCKET_URL, ADMIN_SECRET_KEY } from '@/utils/constants';

class SocketService {
  private socket: Socket | null = null;
  private connectionPromise: Promise<void> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private messageCallbacks: Array<(message: DirectMessage) => void> = [];
  private callCallbacks: Array<(call: Call) => void> = [];
  private callEndCallbacks: Array<(callId: string) => void> = [];
  private typingCallbacks: Array<(data: { conversationId: string; userId: string; isTyping: boolean }) => void> = [];

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
    this.socket.on('call:incoming', (call: Call) => {
      console.log('📞 [SOCKET] Incoming call:', call);
      this.callCallbacks.forEach(callback => callback(call));
    });

    this.socket.on('call:accepted', (call: Call) => {
      console.log('✅ [SOCKET] Call accepted:', call);
      this.callCallbacks.forEach(callback => callback(call));
    });

    this.socket.on('call:rejected', (data: { callId: string; reason?: string }) => {
      console.log('❌ [SOCKET] Call rejected:', data);
      this.callEndCallbacks.forEach(callback => callback(data.callId));
    });

    this.socket.on('call:ended', (data: { callId: string; duration?: number; endReason?: string }) => {
      console.log('📞 [SOCKET] Call ended:', data);
      this.callEndCallbacks.forEach(callback => callback(data.callId));
    });

    this.socket.on('call:missed', (data: { callId: string }) => {
      console.log('📞 [SOCKET] Call missed:', data);
      this.callEndCallbacks.forEach(callback => callback(data.callId));
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

  getMessageHistory(
    conversationId: string,
    page: number = 1,
    limit: number = 50,
    callback: (messages: DirectMessage[]) => void
  ) {
    if (!this.socket?.connected) {
      console.error('❌ Socket not connected');
      return;
    }

    this.socket.emit('dm:history', {
      conversationId,
      page,
      limit,
    });

    // Listen for response
    const handler = (data: { conversationId: string; messages: DirectMessage[] }) => {
      if (data.conversationId === conversationId) {
        callback(data.messages);
        this.socket?.off('dm:history_response', handler);
      }
    };

    this.socket.on('dm:history_response', handler);
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

  acceptCall(callId: string) {
    if (!this.socket?.connected) return;

    this.socket.emit('call:accept', { callId });
    console.log('✅ [SOCKET] Accepting call:', callId);
  }

  rejectCall(callId: string, reason?: string) {
    if (!this.socket?.connected) return;

    this.socket.emit('call:reject', { callId, reason });
    console.log('❌ [SOCKET] Rejecting call:', callId);
  }

  endCall(callId: string, endReason?: string) {
    if (!this.socket?.connected) return;

    this.socket.emit('call:end', { callId, endReason });
    console.log('📞 [SOCKET] Ending call:', callId);
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

  onCall(callback: (call: Call) => void) {
    this.callCallbacks.push(callback);
    return () => {
      this.callCallbacks = this.callCallbacks.filter(cb => cb !== callback);
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

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();


