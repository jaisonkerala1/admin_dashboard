/**
 * Browser Notification Service
 * Handles desktop notifications for incoming messages
 */

export class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';
  private notificationSound: HTMLAudioElement | null = null;

  private constructor() {
    this.permission = Notification.permission;
    this.initSound();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initialize notification sound
   */
  private initSound() {
    try {
      // Using a data URI for a simple notification beep
      // This is a short, pleasant notification sound
      const soundDataUri = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjGH0fPTgjMGHm7A7+OZURE';
      this.notificationSound = new Audio(soundDataUri);
      this.notificationSound.volume = 0.5;
    } catch (error) {
      console.warn('Failed to initialize notification sound:', error);
    }
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Show a browser notification
   */
  async showNotification(
    title: string,
    options?: {
      body?: string;
      icon?: string;
      tag?: string;
      data?: any;
      silent?: boolean;
    }
  ): Promise<Notification | null> {
    // Request permission if not already granted
    if (this.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) {
        console.warn('Notification permission denied');
        return null;
      }
    }

    try {
      const notification = new Notification(title, {
        icon: options?.icon || '/logo.png',
        badge: '/logo.png',
        tag: options?.tag || 'message-notification',
        body: options?.body,
        data: options?.data,
        silent: options?.silent || false,
        requireInteraction: false,
      });

      // Play sound if not silent
      if (!options?.silent) {
        this.playSound();
      }

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }

  /**
   * Show notification for new message
   */
  async showMessageNotification(
    senderName: string,
    message: string,
    astrologerId: string,
    avatarUrl?: string
  ): Promise<Notification | null> {
    return this.showNotification(`💬 ${senderName}`, {
      body: message,
      icon: avatarUrl || '/logo.png',
      tag: `message-${astrologerId}`,
      data: { astrologerId, type: 'message' },
    });
  }

  /**
   * Show notification for incoming call
   */
  async showCallNotification(
    callerName: string,
    callType: 'voice' | 'video',
    callId: string,
    avatarUrl?: string
  ): Promise<Notification | null> {
    const icon = callType === 'video' ? '📹' : '📞';
    return this.showNotification(`${icon} Incoming ${callType} call`, {
      body: `${callerName} is calling...`,
      icon: avatarUrl || '/logo.png',
      tag: `call-${callId}`,
      data: { callId, type: 'call' },
    });
  }

  /**
   * Play notification sound
   */
  playSound() {
    try {
      if (this.notificationSound) {
        this.notificationSound.currentTime = 0;
        this.notificationSound.play().catch(err => {
          console.warn('Failed to play notification sound:', err);
        });
      }
    } catch (error) {
      console.warn('Error playing notification sound:', error);
    }
  }

  /**
   * Check if notifications are supported
   */
  isSupported(): boolean {
    return 'Notification' in window;
  }

  /**
   * Check if permission is granted
   */
  isGranted(): boolean {
    return this.permission === 'granted';
  }

  /**
   * Get current permission status
   */
  getPermission(): NotificationPermission {
    return this.permission;
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();

