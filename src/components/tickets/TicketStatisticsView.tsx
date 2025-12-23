import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchStatisticsRequest, setStatisticsPeriod } from '@/store/slices/ticketSlice';
import { Card, StatCard, Loader } from '@/components/common';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Clock,
  CheckCircle,
  MessageSquare,
  Star,
  AlertTriangle,
} from 'lucide-react';

const CATEGORY_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#6366f1',
];

export const TicketStatisticsView: React.FC = () => {
  const dispatch = useAppDispatch();
  const { statistics, statisticsPeriod, isLoadingStatistics, statisticsError } =
    useAppSelector((state) => state.ticket);

  useEffect(() => {
    dispatch(fetchStatisticsRequest({ period: statisticsPeriod }));
  }, [dispatch, statisticsPeriod]);

  const handlePeriodChange = (period: string) => {
    dispatch(setStatisticsPeriod(period));
    dispatch(fetchStatisticsRequest({ period }));
  };

  if (isLoadingStatistics) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader size="lg" />
      </div>
    );
  }

  if (statisticsError || !statistics) {
    return (
      <Card className="p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 dark:text-red-400">
          {statisticsError || 'Failed to load statistics'}
        </p>
      </Card>
    );
  }

  // Prepare data for charts
  const categoryData = statistics.topCategories.map((cat) => ({
    name: cat.category,
    count: cat.count,
  }));

  const trendsData = statistics.trends.map((trend) => ({
    date: new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    opened: trend.opened,
    closed: trend.closed,
    avgResponseTime: trend.avgResponseTime,
  }));

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Support Statistics
        </h2>
        <div className="flex items-center gap-2">
          {['1d', '7d', '30d', '90d', 'all'].map((period) => (
            <button
              key={period}
              onClick={() => handlePeriodChange(period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statisticsPeriod === period
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {period === '1d'
                ? 'Today'
                : period === '7d'
                ? '7 Days'
                : period === '30d'
                ? '30 Days'
                : period === '90d'
                ? '90 Days'
                : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tickets"
          value={statistics.overview.totalTickets.toString()}
          icon={TrendingUp}
        />
        <StatCard
          title="Open Tickets"
          value={statistics.overview.openTickets.toString()}
          icon={MessageSquare}
        />
        <StatCard
          title="Avg Response Time"
          value={`${statistics.overview.avgResponseTime}m`}
          icon={Clock}
        />
        <StatCard
          title="Avg Resolution Time"
          value={`${Math.round(statistics.overview.avgResolutionTime / 60)}h`}
          icon={CheckCircle}
        />
      </div>

      {/* Satisfaction Rate */}
      {statistics.overview.satisfactionRate && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Customer Satisfaction
              </h3>
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {statistics.overview.satisfactionRate.toFixed(1)}
                </span>
                <span className="text-gray-500 dark:text-gray-400">/ 5.0</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Based on resolved tickets with ratings
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Trends Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Ticket Trends
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="opened"
              name="Opened"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="closed"
              name="Closed"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Categories
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" name="Tickets">
                {categoryData.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Response Time Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Average Response Time (minutes)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="avgResponseTime"
                name="Response Time"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top Admins */}
      {statistics.topAdmins && statistics.topAdmins.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Performing Admins
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tickets Resolved
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Avg Resolution Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                {statistics.topAdmins.map((admin, index) => (
                  <tr key={admin.adminId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 dark:text-primary-400 font-medium">
                            #{index + 1}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {admin.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {admin.ticketsResolved}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {Math.round(admin.avgResolutionTime / 60)}h
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

