import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
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
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAppSelector } from '@/store/hooks';
import { cn } from '@/utils/helpers';
import { APP_NAME, ROUTES } from '@/utils/constants';
import { CheckCircle } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
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
  { name: 'Earnings', href: ROUTES.EARNINGS, icon: Wallet },
  { name: 'Support & Tickets', href: ROUTES.SUPPORT, icon: LifeBuoy },
  { name: 'Approval Requests', href: ROUTES.APPROVALS, icon: CheckCircle },
];

export const Sidebar = () => {
  const { logout } = useAuth();
  const { unreadCount } = useNotifications();
  const pendingApprovals = useAppSelector((state) => state.approval.stats?.totalPending || 0);

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="flex items-center gap-2 h-16 px-6 border-b border-gray-200">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
          <LayoutDashboard className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-gray-900">{APP_NAME}</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
              {/* Unread badge for Communication */}
              {item.href === ROUTES.COMMUNICATION && unreadCount > 0 && (
                <span className="ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full min-w-[20px]">
                  {unreadCount > 99 ? '99+' : unreadCount}
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
      <div className="p-3 border-t border-gray-200">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

