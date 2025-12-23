import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, StatCard } from '@/components/common';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchTicketsRequest } from '@/store/slices/ticketSlice';
import { socketService } from '@/services/socketService';
import {
  TicketListView,
  TicketDetailView,
  TicketStatisticsView,
} from '@/components/tickets';
import {
  LifeBuoy,
  AlertCircle,
  Clock,
  CheckCircle,
  BarChart3,
} from 'lucide-react';

const tabs = [
  { id: 'tickets', name: 'All Tickets', icon: LifeBuoy, path: '/support' },
  { id: 'statistics', name: 'Statistics', icon: BarChart3, path: '/support/statistics' },
];

export const Support = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { stats, isLoadingTickets } = useAppSelector((state) => state.ticket);

  const [activeTab, setActiveTab] = useState('tickets');

  useEffect(() => {
    // Determine active tab based on route
    if (location.pathname.includes('/statistics')) {
      setActiveTab('statistics');
    } else if (location.pathname.includes('/tickets/')) {
      // On detail view, don't change active tab
    } else {
      setActiveTab('tickets');
    }
  }, [location.pathname]);

  useEffect(() => {
    // Fetch tickets to get stats
    if (!location.pathname.includes('/tickets/')) {
      dispatch(fetchTicketsRequest({}));
    }

    // Connect to Socket.IO and join ticket monitor
    socketService.connect();
    socketService.joinTicketMonitor();

    // Set up Socket.IO listeners for real-time updates
    const unsubscribeNewTicket = socketService.onNewTicket(() => {
      // Refresh ticket list when new ticket arrives
      dispatch(fetchTicketsRequest({}));
    });

    const unsubscribeStatusChange = socketService.onTicketStatusChange(() => {
      // Refresh ticket list when status changes
      dispatch(fetchTicketsRequest({}));
    });

    const unsubscribeAssign = socketService.onTicketAssign(() => {
      // Refresh ticket list when ticket is assigned
      dispatch(fetchTicketsRequest({}));
    });

    return () => {
      unsubscribeNewTicket();
      unsubscribeStatusChange();
      unsubscribeAssign();
    };
  }, [dispatch, location.pathname]);

  const handleTabChange = (tabId: string, path: string) => {
    setActiveTab(tabId);
    navigate(path);
  };

  // Don't show tabs and stats on detail view
  const isDetailView = location.pathname.includes('/tickets/') && location.pathname.split('/').length > 3;

  return (
    <MainLayout>
      {!isDetailView && (
        <>
          <PageHeader
            title="Support & Tickets"
            subtitle="Manage and respond to user support tickets"
          />

          {/* Stats Overview */}
          {stats && !isLoadingTickets && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                title="Total Tickets"
                value={stats.totalTickets.toString()}
                icon={LifeBuoy}
                trend={
                  stats.openTickets > 0
                    ? {
                        value: stats.openTickets,
                        isPositive: false,
                      }
                    : undefined
                }
              />
              <StatCard
                title="Open Tickets"
                value={stats.openTickets.toString()}
                icon={AlertCircle}
              />
              <StatCard
                title="In Progress"
                value={stats.inProgressTickets.toString()}
                icon={Clock}
              />
              <StatCard
                title="Closed Today"
                value={stats.closedToday.toString()}
                icon={CheckCircle}
              />
            </div>
          )}

          {/* Tabs */}
          <Card className="mb-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex -mb-px">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id, tab.path)}
                      className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                        isActive
                          ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.name}
                      {tab.id === 'tickets' && stats && stats.openTickets > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400">
                          {stats.openTickets}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </Card>
        </>
      )}

      {/* Routes */}
      <Routes>
        <Route path="/" element={<TicketListView />} />
        <Route path="/tickets/:ticketId" element={<TicketDetailView />} />
        <Route path="/statistics" element={<TicketStatisticsView />} />
      </Routes>
    </MainLayout>
  );
};

