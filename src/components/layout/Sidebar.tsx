import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bell,
  Users,
  UserCog,
  Calendar,
  CalendarClock,
  ShoppingBag,
  ClipboardList,
  Star,
  Radio,
  MessageSquare,
  MessageCircle,
  BarChart3,
  Wallet,
  LifeBuoy,
  LogOut,
  TrendingUp,
  X,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAppSelector } from '@/store/hooks';
import { cn } from '@/utils/helpers';
import { APP_NAME, ROUTES } from '@/utils/constants';
import { CheckCircle } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { name: 'Notifications', href: ROUTES.NOTIFICATIONS, icon: Bell },
  { name: 'Astrologers', href: ROUTES.ASTROLOGERS, icon: UserCog },
  { name: 'Users', href: ROUTES.USERS, icon: Users },
  { name: 'Consultations', href: ROUTES.CONSULTATIONS, icon: Calendar },
  { name: 'Calendar & Availability', href: ROUTES.CALENDAR, icon: CalendarClock },
  { name: 'Services', href: ROUTES.SERVICES, icon: ShoppingBag },
  { name: 'Service Requests', href: ROUTES.SERVICE_REQUESTS, icon: ClipboardList },
  { name: 'Reviews', href: ROUTES.REVIEWS, icon: Star },
  { name: 'Live Streams', href: ROUTES.LIVE_STREAMS, icon: Radio },
  { name: 'Discussions', href: ROUTES.DISCUSSIONS, icon: MessageSquare },
  { name: 'Communication', href: ROUTES.COMMUNICATION, icon: MessageCircle },
  { name: 'Communication Analytics', href: ROUTES.COMMUNICATION_ANALYTICS, icon: TrendingUp },
  { name: 'Analytics', href: ROUTES.ANALYTICS, icon: BarChart3 },
  { name: 'Earnings', href: ROUTES.EARNINGS, icon: TrendingUp },
  { name: 'Wallet', href: ROUTES.WALLET, icon: Wallet },
  { name: 'Support & Tickets', href: ROUTES.SUPPORT, icon: LifeBuoy },
  { name: 'Approval Requests', href: ROUTES.APPROVALS, icon: CheckCircle },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ isOpen = true, onClose }: SidebarProps) => {
  const { logout } = useAuth();
  const { unreadCount: communicationUnread } = useNotifications();
  const { unreadCount: notificationsUnread } = useAppSelector((state) => state.notification);
  const pendingApprovals = useAppSelector((state) => state.approval.stats?.totalPending || 0);

  return (
    <>
      {/* Mobile Overlay */}
      {onClose && (
        <div
          className={cn(
            'fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity',
            isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 z-50 transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 h-16 px-6 border-b border-gray-200">
          <span className="font-bold text-gray-900 text-lg">{APP_NAME}</span>
          <span className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
          {/* Mobile Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="ml-auto lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-4">
          <div className="space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative',
                    isActive
                      ? 'bg-purple-50 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )
                }
              >
                <item.icon
                  className={cn(
                    'w-5 h-5 flex-shrink-0',
                    'text-gray-600'
                  )}
                />
                <span className="flex-1">{item.name}</span>
                {/* Unread badge for Notifications */}
                {item.href === ROUTES.NOTIFICATIONS && notificationsUnread > 0 && (
                  <span className="ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-primary-600 rounded-full min-w-[20px]">
                    {notificationsUnread > 99 ? '99+' : notificationsUnread}
                  </span>
                )}
                {/* Unread badge for Communication */}
                {item.href === ROUTES.COMMUNICATION && communicationUnread > 0 && (
                  <span className="ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full min-w-[20px]">
                    {communicationUnread > 99 ? '99+' : communicationUnread}
                  </span>
                )}
                {/* Pending badge for Approval Requests */}
                {item.href === ROUTES.APPROVALS && pendingApprovals > 0 && (
                  <span className="ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-orange-500 rounded-full min-w-[20px]">
                    {pendingApprovals > 99 ? '99+' : pendingApprovals}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

