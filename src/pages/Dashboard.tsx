import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCog, Calendar, DollarSign, AlertCircle, TrendingUp, Radio, Eye, Clock, Play, ShoppingBag } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard, Card, Loader, Avatar } from '@/components/common';
import { LiveStreamViewer } from '@/components/liveStream/LiveStreamViewer';
import { dashboardApi, liveStreamsApi, astrologersApi, poojaRequestsApi } from '@/api';
import { DashboardStats, LiveStream, Astrologer } from '@/types';
import { formatCurrency, formatNumber, formatRelativeTime } from '@/utils/formatters';
import { ROUTES } from '@/utils/constants';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
  const [onlineAstrologers, setOnlineAstrologers] = useState<Astrologer[]>([]);
  const [onlineLoading, setOnlineLoading] = useState(false);
  const [serviceRequestsTotal, setServiceRequestsTotal] = useState(0);
  const [serviceRequestsByDay, setServiceRequestsByDay] = useState<Record<string, number>>({});

  useEffect(() => {
    loadStats();
    loadLiveStreams();
    loadOnlineAstrologers();
    loadServiceRequests();

    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      loadLiveStreams();
      loadOnlineAstrologers();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const response = await dashboardApi.getStats();
      setStats(response.data || null);
      setError('');
    } catch (err: any) {
      console.error('Dashboard error:', err);
      setError(err.message || 'Failed to load dashboard stats');
    } finally {
      setIsLoading(false);
    }
  };

  const loadLiveStreams = async () => {
    try {
      setLiveLoading(true);
      const response = await liveStreamsApi.getAll({ 
        page: 1, 
        limit: 5, 
        sortBy: 'createdAt', 
        sortOrder: 'desc' 
      });
      // Filter only active streams
      const activeStreams = response.data.filter((stream: LiveStream) => stream.isLive);
      setLiveStreams(activeStreams);
    } catch (err) {
      console.error('Live streams error:', err);
    } finally {
      setLiveLoading(false);
    }
  };

  const loadOnlineAstrologers = async () => {
    try {
      setOnlineLoading(true);
      const response = await astrologersApi.getOnlineList();
      setOnlineAstrologers(response.data || []);
    } catch (err) {
      console.error('Online astrologers error:', err);
    } finally {
      setOnlineLoading(false);
    }
  };

  const loadServiceRequests = async () => {
    try {
      // Fetch a reasonable window and compute last-7-days counts from real data.
      // If volume gets large, the backend should expose an aggregated endpoint.
      const response = await poojaRequestsApi.getAll({ page: 1, limit: 500, sortBy: 'createdAt', sortOrder: 'desc' } as any);
      setServiceRequestsTotal(response.pagination?.total || 0);

      const toDateKey = (d: Date) => {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      };

      const today = new Date();
      const start = new Date(today);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);

      const counts: Record<string, number> = {};
      for (const req of response.data || []) {
        const createdAt = (req as any)?.createdAt;
        if (!createdAt) continue;
        const created = new Date(createdAt);
        if (Number.isNaN(created.getTime())) continue;
        if (created < start) continue;
        const key = toDateKey(created);
        counts[key] = (counts[key] || 0) + 1;
      }

      setServiceRequestsByDay(counts);
    } catch (err) {
      console.error('Service requests error:', err);
    }
  };

  // Generate weekly data for charts (last 7 days)
  const getWeeklyData = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      // Simulate data - in production, this should come from backend
      // Random distribution across the week with some pattern
      const baseConsultations = Math.floor((stats?.consultations.total || 0) / 30);
      
      const consultations = Math.max(0, baseConsultations + Math.floor(Math.random() * (baseConsultations * 0.5)));
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const key = `${yyyy}-${mm}-${dd}`;
      const serviceRequests = serviceRequestsByDay[key] || 0;
      
      days.push({
        day: dayName,
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        consultations,
        serviceRequests
      });
    }
    
    return days;
  };

  const weeklyData = stats ? getWeeklyData() : [];

  return (
    <MainLayout>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome to your platform management dashboard"
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size="lg" text="Loading dashboard..." />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : stats ? (
        <div className="space-y-6">
          {/* Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Astrologers"
              value={formatNumber(stats.astrologers.total)}
              icon={UserCog}
            />
            <StatCard
              title="Total Users"
              value={formatNumber(stats.users.total)}
              icon={Users}
            />
            <StatCard
              title="Consultations"
              value={formatNumber(stats.consultations.total)}
              icon={Calendar}
            />
            <StatCard
              title="Total Revenue"
              value={formatCurrency(stats.revenue.total)}
              icon={DollarSign}
            />
          </div>

          {/* Weekly Activity Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Consultations Chart */}
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>Consultations (Last 7 Days)</span>
                </div>
              }
            >
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="day" 
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
                    {weeklyData.reduce((sum, day) => sum + day.consultations, 0)}
                  </p>
                  <p className="text-sm text-gray-500">Total this week</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-semibold">
                      {((weeklyData.reduce((sum, day) => sum + day.consultations, 0) / stats.consultations.total) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">of total</p>
                </div>
              </div>
            </Card>

            {/* Service Requests Chart */}
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-purple-600" />
                  <span>Service Requests (Last 7 Days)</span>
                </div>
              }
            >
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="day" 
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
                    {weeklyData.reduce((sum, day) => sum + day.serviceRequests, 0)}
                  </p>
                  <p className="text-sm text-gray-500">Total this week</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-semibold">
                      {serviceRequestsTotal > 0 
                        ? ((weeklyData.reduce((sum, day) => sum + day.serviceRequests, 0) / serviceRequestsTotal) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">of total</p>
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
            <Card title="Astrologers Overview">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Active</span>
                  <span className="font-semibold text-green-600">{formatNumber(stats.astrologers.active)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <Link to={ROUTES.ASTROLOGER_APPROVALS} className="text-amber-600 hover:text-amber-700">
                    Pending Approvals
                  </Link>
                  <span className="font-semibold text-amber-600">{formatNumber(stats.astrologers.pendingApprovals)}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Suspended</span>
                  <span className="font-semibold text-red-600">{formatNumber(stats.astrologers.suspended)}</span>
                </div>
              </div>
            </Card>

            {/* Users Overview */}
            <Card title="Users Overview">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Active Users</span>
                  <span className="font-semibold text-green-600">{formatNumber(stats.users.active)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Banned Users</span>
                  <span className="font-semibold text-red-600">{formatNumber(stats.users.banned)}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Total</span>
                  <span className="font-semibold">{formatNumber(stats.users.total)}</span>
                </div>
              </div>
            </Card>

            {/* Consultations Overview */}
            <Card title="Consultations Overview">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Ongoing</span>
                  <span className="font-semibold text-blue-600">{formatNumber(stats.consultations.ongoing)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-semibold text-green-600">{formatNumber(stats.consultations.completed)}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Total</span>
                  <span className="font-semibold">{formatNumber(stats.consultations.total)}</span>
                </div>
              </div>
            </Card>

            {/* Services & More */}
            <Card title="Services & Activity">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Active Services</span>
                  <span className="font-semibold">{formatNumber(stats.services.active)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Pending Services</span>
                  <span className="font-semibold text-amber-600">{formatNumber(stats.services.pending)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Live Streams</span>
                  <span className="font-semibold text-red-600">{formatNumber(stats.liveStreams.active)}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Total Reviews</span>
                  <span className="font-semibold">{formatNumber(stats.reviews.total)}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Revenue Stats */}
          <Card
            title="Revenue Overview"
            action={
              <Link to={ROUTES.ANALYTICS} className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium">
                View Analytics <TrendingUp className="w-4 h-4" />
              </Link>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.revenue.total)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">This Month</p>
                <p className="text-3xl font-bold text-primary-600">{formatCurrency(stats.revenue.monthly)}</p>
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
              loadLiveStreams(); // Refresh list
            } catch (err) {
              console.error('Failed to end stream:', err);
            }
          }}
        />
      )}
    </MainLayout>
  );
};

