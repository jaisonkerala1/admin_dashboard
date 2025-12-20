import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { socketService } from '@/services/socketService';
import { notificationService } from '@/services/notificationService';
import { useToast } from './ToastContext';

interface NotificationContextType {
  unreadCount: number;
  unreadByAstrologer: Record<string, number>;
  markAsRead: (astrologerId: string) => void;
  requestPermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadByAstrologer, setUnreadByAstrologer] = useState<Record<string, number>>({});
  const { showToast } = useToast();

  useEffect(() => {
    // Connect to socket
    socketService.connectAndWait().catch(console.error);

    // Listen for incoming messages
    const unsubscribe = socketService.onMessage((message) => {
      // Only count messages from astrologers (not from admin)
      if (message.senderType === 'astrologer') {
        const astrologerId =
          message.senderType === 'astrologer'
            ? message.senderId
            : message.recipientType === 'astrologer'
              ? message.recipientId
              : undefined;

        if (!astrologerId) return;

        // Update unread count
        setUnreadByAstrologer((prev) => ({
          ...prev,
          [astrologerId]: (prev[astrologerId] || 0) + 1,
        }));

        setUnreadCount((prev) => prev + 1);

        // Show browser notification
        notificationService.showMessageNotification(
          message.senderName || 'Astrologer',
          message.content,
          astrologerId,
          message.senderAvatar
        );

        // Show toast notification (only if not on Communication page)
        if (!window.location.pathname.includes('/communication')) {
          showToast({
            type: 'info',
            message: `${message.senderName || 'Astrologer'}: ${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}`,
            duration: 5000,
          });
        }

        // Play sound
        notificationService.playSound();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [showToast]);

  const markAsRead = (astrologerId: string) => {
    setUnreadByAstrologer((prev) => {
      const count = prev[astrologerId] || 0;
      setUnreadCount((total) => Math.max(0, total - count));
      const newState = { ...prev };
      delete newState[astrologerId];
      return newState;
    });
  };

  const requestPermission = async () => {
    return notificationService.requestPermission();
  };

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        unreadByAstrologer,
        markAsRead,
        requestPermission,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

