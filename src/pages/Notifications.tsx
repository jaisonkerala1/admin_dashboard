import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Check, 
  Trash2, 
  Clock, 
  AlertCircle, 
  MessageSquare, 
  Phone, 
  UserCheck, 
  Wallet, 
  Ticket,
  ExternalLink
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/common';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  markAsRead, 
  markAllAsRead, 
  deleteNotification, 
  fetchNotificationsRequest 
} from '@/store/slices/notificationSlice';
import { formatRelativeTime } from '@/utils/formatters';
import { NotificationType } from '@/types/notification';

export const Notifications: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { notifications, unreadCount } = useAppSelector((state) => state.notification);

  useEffect(() => {
    dispatch(fetchNotificationsRequest());
  }, [dispatch]);

  const handleMarkAsRead = (id: string) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(deleteNotification(id));
  };

  const handleNotificationClick = (notification: any) => {
    handleMarkAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'system': return <AlertCircle className="w-5 h-5 text-gray-400" />;
      case 'message': return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'call': return <Phone className="w-5 h-5 text-green-500" />;
      case 'approval': return <UserCheck className="w-5 h-5 text-amber-500" />;
      case 'payout': return <Wallet className="w-5 h-5 text-emerald-500" />;
      case 'ticket': return <Ticket className="w-5 h-5 text-purple-500" />;
      case 'alert': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <MainLayout>
      <PageHeader 
        title="Notifications" 
        subtitle="Stay updated with platform activities"
        action={
          unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <Check className="w-4 h-4" />
              Mark all as read
            </button>
          )
        }
      />

      <div className="max-w-4xl mx-auto">
        {notifications.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">All caught up!</h3>
            <p className="text-gray-500">You don't have any notifications at the moment.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`group relative flex items-start gap-4 p-4 bg-white rounded-2xl border transition-all duration-200 cursor-pointer hover:shadow-md ${
                  notification.isRead ? 'border-gray-100 opacity-75' : 'border-primary-100 bg-primary-50/10 shadow-sm ring-1 ring-primary-50'
                }`}
              >
                {/* Status Dot */}
                {!notification.isRead && (
                  <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary-600 rounded-full" />
                )}

                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  notification.isRead ? 'bg-gray-50' : 'bg-white shadow-sm'
                }`}>
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <h4 className={`text-sm sm:text-base font-semibold truncate ${
                      notification.isRead ? 'text-gray-700' : 'text-gray-900'
                    }`}>
                      {notification.title}
                    </h4>
                    <span className="flex-shrink-0 flex items-center gap-1 text-[11px] font-medium text-gray-400">
                      <Clock className="w-3 h-3" />
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed ${
                    notification.isRead ? 'text-gray-500' : 'text-gray-600'
                  }`}>
                    {notification.message}
                  </p>
                  
                  {notification.link && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-primary-600 uppercase tracking-wider">
                      View Details <ExternalLink className="w-3 h-3" />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  {!notification.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification.id);
                      }}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDelete(notification.id, e)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

