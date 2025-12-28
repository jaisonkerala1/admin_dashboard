import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notification, NotificationState } from '@/types/notification';

const initialState: NotificationState = {
  notifications: [
    {
      id: '1',
      title: 'New Astrologer Approval',
      message: 'Guru has submitted their documents for verification.',
      type: 'approval',
      isRead: false,
      createdAt: new Date().toISOString(),
      link: '/approvals',
    },
    {
      id: '2',
      title: 'Payout Request',
      message: 'Astrologer "Mahesh" has requested a payout of ₹1,200.',
      type: 'payout',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      link: '/wallet',
    },
    {
      id: '3',
      title: 'Support Ticket #1024',
      message: 'A user reported an issue with their last consultation.',
      type: 'ticket',
      isRead: true,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      link: '/support',
    },
    {
      id: '4',
      title: 'System Alert',
      message: 'Database backup completed successfully.',
      type: 'system',
      isRead: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    }
  ],
  unreadCount: 2,
  isLoading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    fetchNotificationsRequest: (state) => {
      state.isLoading = true;
    },
    fetchNotificationsSuccess: (state, action: PayloadAction<Notification[]>) => {
      state.isLoading = false;
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.isRead).length;
    },
    fetchNotificationsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount -= 1;
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(n => {
        n.isRead = true;
      });
      state.unreadCount = 0;
    },
    deleteNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        state.unreadCount -= 1;
      }
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    }
  },
});

export const {
  fetchNotificationsRequest,
  fetchNotificationsSuccess,
  fetchNotificationsFailure,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  addNotification,
} = notificationSlice.actions;

export default notificationSlice.reducer;

