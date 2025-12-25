import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCog, Calendar, DollarSign, AlertCircle, TrendingUp, Radio, Eye, Clock, Play, ShoppingBag, Bell, X, MessageSquare, Phone, Video } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard, Card, Avatar } from '@/components/common';
import { StatCardSkeleton, ChartSkeleton } from '@/components/common';
import { LiveStreamViewer } from '@/components/liveStream/LiveStreamViewer';
import { liveStreamsApi } from '@/api';
import { formatCurrency, formatNumber, formatRelativeTime } from '@/utils/formatters';
import { ROUTES } from '@/utils/constants';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useNotifications } from '@/contexts/NotificationContext';
import {
  fetchDashboardRequest,
  fetchGlobalStatsRequest,
  fetchLiveStreamsRequest,
  fetchOnlineAstrologersRequest,
  setPeriod,
  type DashboardPeriod,
} from '@/store/slices/dashboardSlice';
import { fetchStatsRequest } from '@/store/slices/communicationSlice';

export const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { requestPermission } = useNotifications();
  const { period, isLoading, error, periodStats, chartData, globalStats, liveStreams, liveLoading, onlineAstrologers, onlineLoading } =
    useAppSelector((s) => s.dashboard);
  const { stats: communicationStats } = useAppSelector((s) => s.communication);

  const [selectedStream, setSelectedStream] = useState<any | null>(null);
  const [showNotificationBanner, setShowNotificationBanner] = useState(() => {
    // Check if user dismissed banner or already granted permission
    const dismissed = localStorage.getItem('notification-banner-dismissed');
    const permission = Notification?.permission;
    return !dismissed && permission !== 'granted';
  });

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      setShowNotificationBanner(false);
      localStorage.setItem('notification-banner-dismissed', 'true');
    }
  };

  const handleDismissBanner = () => {
    setShowNotificationBanner(false);
    localStorage.setItem('notification-banner-dismissed', 'true');
  };

  useEffect(() => {
    // Initial load
    dispatch(fetchDashboardRequest({ period }));
    dispatch(fetchGlobalStatsRequest());
    dispatch(fetchLiveStreamsRequest());
    dispatch(fetchOnlineAstrologersRequest());
    dispatch(fetchStatsRequest({ period: '7d' }));

    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      dispatch(fetchLiveStreamsRequest());
      dispatch(fetchOnlineAstrologersRequest());
    }, 10000);
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchDashboardRequest({ period }));
  }, [dispatch, period]);

  const periodLabel = useMemo(() => {
    const map: Record<DashboardPeriod, string> = {
      '1d': '1 Day',
      '7d': '7 Days',
      '1m': '1 Month',
      '1y': '1 Year',
      '3y': '3 Years',
    };
    return map[period];
  }, [period]);

  const periodOptions: { key: DashboardPeriod; label: string }[] = useMemo(
    () => [
      { key: '1d', label: '1 Day' },
      { key: '7d', label: '7 Days' },
      { key: '1m', label: '1 Month' },
      { key: '1y', label: '1 Year' },
      { key: '3y', label: '3 Years' },
    ],
    []
  );

  return (
    <MainLayout>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome to your platform management dashboard"
      />

      {/* Notification Permission Banner */}
      {showNotificationBanner && (
        <div className="mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg">
          <div className="px-4 py-3 sm:px-6 sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center flex-1 min-w-0">
              <Bell className="h-6 w-6 text-white flex-shrink-0" />
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-white">
                  Enable Desktop Notifications
                </h3>
                <p className="mt-1 text-sm text-indigo-100">
                  Get instant alerts when astrologers send you messages or call
                </p>
              </div>
            </div>
            <div className="mt-3 sm:mt-0 sm:ml-4 flex items-center gap-2">
              <button
                onClick={handleEnableNotifications}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors"
              >
                Enable
              </button>
              <button
                onClick={handleDismissBanner}
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-white hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-6">
          {/* Period Selector Skeleton */}
          <div className="border-b border-gray-200">
            <div className="flex gap-6 overflow-x-auto pb-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-6 w-16 bg-gray-200 rounded shimmer" />
              ))}
            </div>
          </div>
          
          {/* Key Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
          
          {/* Chart Skeleton */}
          <ChartSkeleton height={300} />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : periodStats ? (
        <div className="space-y-6">
          {/* Period Selector */}
          <div className="border-b border-gray-200">
            <div className="flex gap-6 overflow-x-auto">
              {periodOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => dispatch(setPeriod(opt.key))}
                  className={`pb-3 px-1 border-b-2 whitespace-nowrap transition-colors ${
                    period === opt.key
                      ? 'border-blue-500 text-blue-600 font-semibold'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title={`New Astrologers (${periodLabel})`}
              value={formatNumber(periodStats.astrologersNew)}
              icon={UserCog}
            />
            <StatCard
              title={`New Users (${periodLabel})`}
              value={formatNumber(periodStats.usersNew)}
              icon={Users}
            />
            <StatCard
              title={`Consultations (${periodLabel})`}
              value={formatNumber(periodStats.consultations)}
              icon={Calendar}
            />
            <StatCard
              title={`Revenue (${periodLabel})`}
              value={formatCurrency(periodStats.revenue)}
              icon={DollarSign}
            />
          </div>

          {/* Communication Stats */}
          {communicationStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                title="Total Messages"
                value={formatNumber(communicationStats.totalMessages)}
                icon={MessageSquare}
                iconColor="text-blue-600"
                iconBgColor="bg-blue-50"
              />
              <StatCard
                title="Voice Calls"
                value={formatNumber(communicationStats.totalVoiceCalls)}
                icon={Phone}
                iconColor="text-green-600"
                iconBgColor="bg-green-50"
              />
              <StatCard
                title="Video Calls"
                value={formatNumber(communicationStats.totalVideoCalls)}
                icon={Video}
                iconColor="text-purple-600"
                iconBgColor="bg-purple-50"
              />
              <StatCard
                title="Total Communications"
                value={formatNumber(communicationStats.totalCommunications)}
                icon={TrendingUp}
                iconColor="text-indigo-600"
                iconBgColor="bg-indigo-50"
              />
            </div>
          )}

          {/* Communication Analytics Link */}
          {communicationStats && (
            <div className="mb-6">
              <Link
                to={ROUTES.COMMUNICATION_ANALYTICS}
                className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View Full Communication Analytics <TrendingUp className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Weekly Activity Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Consultations Chart */}
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>Consultations</span>
                </div>
              }
            >
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="label" 
                      tick={{ fontSize: 12 }}
                      stroke="#9ca3af"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="#9ca3af"
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '8px 12px'
                      }}
                      labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="consultations" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Consultations"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(periodStats.consultations)}
                  </p>
                  <p className="text-sm text-gray-500">Total ({periodLabel})</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-semibold">{formatNumber(periodStats.completedConsultations)} completed</span>
                  </div>
                  <p className="text-xs text-gray-500">in period</p>
                </div>
              </div>
            </Card>

            {/* Service Requests Chart */}
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-purple-600" />
                  <span>Service Requests</span>
                </div>
              }
            >
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="label" 
                      tick={{ fontSize: 12 }}
                      stroke="#9ca3af"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="#9ca3af"
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '8px 12px'
                      }}
                      labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
                    />
                    <Bar 
                      dataKey="serviceRequests" 
                      fill="#8b5cf6" 
                      radius={[8, 8, 0, 0]}
                      name="Service Requests"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(periodStats.serviceRequests)}
                  </p>
                  <p className="text-sm text-gray-500">Total ({periodLabel})</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-semibold">{formatNumber(periodStats.serviceRequests)}</span>
                  </div>
                  <p className="text-xs text-gray-500">in period</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Currently Live Section */}
          {liveStreams.length > 0 && (
            <Card
              title={
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Radio className="w-5 h-5 text-red-500" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                  </div>
                  <span>Currently Live</span>
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                    {liveStreams.length} Active
                  </span>
                </div>
              }
              action={
                <Link to={ROUTES.LIVE_STREAMS} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  View All Streams
                </Link>
              }
            >
              <div className="space-y-3">
                {liveStreams.map((stream) => (
                  <div 
                    key={stream._id}
                    className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:border-red-200 hover:bg-red-50/30 transition-all"
                  >
                    {/* Astrologer Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar
                        src={stream.astrologerId?.profilePicture}
                        name={stream.astrologerId?.name || 'Astrologer'}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 truncate">
                            {stream.astrologerId?.name || 'Unknown Astrologer'}
                          </p>
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white text-xs font-medium rounded">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                            LIVE
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{stream.title}</p>
                      </div>
                    </div>

                    {/* Stream Stats */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Eye className="w-4 h-4" />
                        <span className="font-medium">{formatNumber(stream.viewerCount || 0)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{formatRelativeTime(stream.startedAt || stream.createdAt)}</span>
                      </div>
                      <button
                        onClick={() => setSelectedStream(stream)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        <span>Watch</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* No Live Streams */}
          {!liveLoading && liveStreams.length === 0 && (
            <Card>
              <div className="text-center py-8">
                <Radio className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No live streams at the moment</p>
                <Link to={ROUTES.LIVE_STREAMS} className="text-sm text-primary-600 hover:text-primary-700 mt-2 inline-block">
                  View Stream History
                </Link>
              </div>
            </Card>
          )}

          {/* Currently Online Astrologers */}
          {onlineAstrologers.length > 0 && (
            <Card
              title={
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <UserCog className="w-5 h-5 text-green-500" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  </div>
                  <span>Currently Online</span>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    {onlineAstrologers.length} Available
                  </span>
                </div>
              }
              action={
                <Link to={ROUTES.ASTROLOGERS} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  View All Astrologers
                </Link>
              }
            >
              <div className="space-y-3">
                {onlineAstrologers.slice(0, 5).map((astrologer) => (
                  <div 
                    key={astrologer._id}
                    className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:border-green-200 hover:bg-green-50/30 transition-all"
                  >
                    {/* Astrologer Info */}
                    <Link to={`${ROUTES.ASTROLOGERS}/${astrologer._id}`} className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity">
                      <Avatar
                        src={astrologer.profilePicture}
                        name={astrologer.name}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 truncate">
                            {astrologer.name}
                          </p>
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500 text-white text-xs font-medium rounded">
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                            Online
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {astrologer.specialization?.slice(0, 2).join(', ') || 'Astrologer'}
                        </p>
                      </div>
                    </Link>

                    {/* Astrologer Stats */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">{astrologer.rating?.toFixed(1) || '0.0'}</p>
                        <p className="text-xs text-gray-500">Rating</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">{formatNumber(astrologer.totalConsultations || 0)}</p>
                        <p className="text-xs text-gray-500">Sessions</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* No Online Astrologers */}
          {!onlineLoading && onlineAstrologers.length === 0 && (
            <Card>
              <div className="text-center py-8">
                <UserCog className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No astrologers currently online</p>
                <Link to={ROUTES.ASTROLOGERS} className="text-sm text-primary-600 hover:text-primary-700 mt-2 inline-block">
                  View All Astrologers
                </Link>
              </div>
            </Card>
          )}

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Astrologers Overview */}
            <Card title="Astrologers Overview (All-time)">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Active</span>
                  <span className="font-semibold text-green-600">{formatNumber(globalStats?.astrologers.active || 0)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <Link to={ROUTES.ASTROLOGER_APPROVALS} className="text-amber-600 hover:text-amber-700">
                    Pending Approvals
                  </Link>
                  <span className="font-semibold text-amber-600">{formatNumber(globalStats?.astrologers.pendingApprovals || 0)}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Suspended</span>
                  <span className="font-semibold text-red-600">{formatNumber(globalStats?.astrologers.suspended || 0)}</span>
                </div>
              </div>
            </Card>

            {/* Users Overview */}
            <Card title="Users Overview (All-time)">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Active Users</span>
                  <span className="font-semibold text-green-600">{formatNumber(globalStats?.users.active || 0)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Banned Users</span>
                  <span className="font-semibold text-red-600">{formatNumber(globalStats?.users.banned || 0)}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Total</span>
                  <span className="font-semibold">{formatNumber(globalStats?.users.total || 0)}</span>
                </div>
              </div>
            </Card>

            {/* Consultations Overview */}
            <Card title="Consultations Overview (All-time)">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Ongoing</span>
                  <span className="font-semibold text-blue-600">{formatNumber(globalStats?.consultations.ongoing || 0)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-semibold text-green-600">{formatNumber(globalStats?.consultations.completed || 0)}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Total</span>
                  <span className="font-semibold">{formatNumber(globalStats?.consultations.total || 0)}</span>
                </div>
              </div>
            </Card>

            {/* Services & More */}
            <Card title="Services & Activity (All-time)">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Active Services</span>
                  <span className="font-semibold">{formatNumber(globalStats?.services.active || 0)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Pending Services</span>
                  <span className="font-semibold text-amber-600">{formatNumber(globalStats?.services.pending || 0)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Live Streams</span>
                  <span className="font-semibold text-red-600">{formatNumber(globalStats?.liveStreams.active || 0)}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Total Reviews</span>
                  <span className="font-semibold">{formatNumber(globalStats?.reviews.total || 0)}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Revenue Stats */}
          <Card
            title="Revenue Overview (All-time)"
            action={
              <Link to={ROUTES.ANALYTICS} className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium">
                View Analytics <TrendingUp className="w-4 h-4" />
              </Link>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(globalStats?.revenue.total || 0)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">This Month</p>
                <p className="text-3xl font-bold text-primary-600">{formatCurrency(globalStats?.revenue.monthly || 0)}</p>
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      {/* Live Stream Viewer Modal */}
      {selectedStream && (
        <LiveStreamViewer
          stream={selectedStream}
          onClose={() => setSelectedStream(null)}
          onEndStream={async () => {
            try {
              await liveStreamsApi.end(selectedStream._id, {
                reason: 'Ended by admin'
              });
              setSelectedStream(null);
              dispatch(fetchLiveStreamsRequest()); // Refresh list
            } catch (err) {
              console.error('Failed to end stream:', err);
            }
          }}
        />
      )}
    </MainLayout>
  );
};

