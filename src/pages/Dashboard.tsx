import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCog, Calendar, DollarSign, AlertCircle, TrendingUp } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard, Card, Loader } from '@/components/common';
import { dashboardApi } from '@/api';
import { DashboardStats } from '@/types';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { ROUTES } from '@/utils/constants';

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const response = await dashboardApi.getStats();
      setStats(response.data);
      setError('');
    } catch (err: any) {
      console.error('Dashboard error:', err);
      setError(err.message || 'Failed to load dashboard stats');
    } finally {
      setIsLoading(false);
    }
  };

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
    </MainLayout>
  );
};

