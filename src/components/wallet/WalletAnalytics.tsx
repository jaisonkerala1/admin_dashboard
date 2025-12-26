import { WalletAnalytics as WalletAnalyticsData } from '@/types/wallet';
import { formatCurrency } from '@/utils/formatters';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { TrendingUp, Clock, CheckCircle, Activity } from 'lucide-react';

interface WalletAnalyticsProps {
  analytics: WalletAnalyticsData;
  isLoading?: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const WalletAnalytics = ({ analytics, isLoading }: WalletAnalyticsProps) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="h-24 bg-gray-200 rounded shimmer" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="h-64 bg-gray-200 rounded shimmer" />
        </div>
      </div>
    );
  }

  // Prepare chart data
  const trendData = analytics.weeklyTrend.map((point) => ({
    date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    deposits: point.deposits,
    withdrawals: point.withdrawals,
    payments: point.payments,
  }));

  const typeData = analytics.byType.map((item) => ({
    name: item.type.charAt(0).toUpperCase() + item.type.slice(1),
    value: item.amount,
    percentage: item.percentage,
  }));

  const statusData = analytics.byStatus.map((item) => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    count: item.count,
    percentage: item.percentage,
  }));

  return (
    <div className="space-y-6">
      {/* Performance Metrics Grid - Minimal Flat Design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-5 hover:shadow-md hover:border-gray-300 transition-all duration-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 mb-1">Avg Transaction Value</p>
              <p className="text-xl font-bold text-gray-900 truncate">{formatCurrency(analytics.averageTransactionValue)}</p>
            </div>
          </div>
          <div className="text-xs text-green-600 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+5.2% from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-5 hover:shadow-md hover:border-gray-300 transition-all duration-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 mb-1">Daily Active Wallets</p>
              <p className="text-xl font-bold text-gray-900 truncate">{analytics.dailyActiveWallets.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-xs text-green-600 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+12.5% from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-5 hover:shadow-md hover:border-gray-300 transition-all duration-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 mb-1">Success Rate</p>
              <p className="text-xl font-bold text-gray-900 truncate">{analytics.transactionSuccessRate.toFixed(1)}%</p>
            </div>
          </div>
          <div className="text-xs text-gray-500">Last 30 days</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-5 hover:shadow-md hover:border-gray-300 transition-all duration-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 mb-1">Peak Transaction Hour</p>
              <p className="text-xl font-bold text-gray-900 truncate">{analytics.peakTransactionHour}</p>
            </div>
          </div>
          <div className="text-xs text-gray-500">Most active time</div>
        </div>
      </div>

      {/* Transaction Trend Chart - Orange Line Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 lg:p-6 hover:shadow-md hover:border-gray-300 transition-all duration-200">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Transaction Trend</h3>
          <p className="text-xs text-gray-500 mt-0.5">Deposits vs Withdrawals vs Payments over time</p>
        </div>
        <div className="h-64 lg:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                stroke="#9ca3af"
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                stroke="#9ca3af"
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="deposits" stroke="#10b981" strokeWidth={2} name="Deposits" dot={false} />
              <Line type="monotone" dataKey="withdrawals" stroke="#ef4444" strokeWidth={2} name="Withdrawals" dot={false} />
              <Line type="monotone" dataKey="payments" stroke="#ea580c" strokeWidth={2} name="Payments" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transaction by Type & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Type - Donut Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 lg:p-6 hover:shadow-md hover:border-gray-300 transition-all duration-200">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Transaction by Type</h3>
            <p className="text-xs text-gray-500 mt-0.5">Breakdown by transaction type</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage.toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* By Status - Bar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 lg:p-6 hover:shadow-md hover:border-gray-300 transition-all duration-200">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Transaction by Status</h3>
            <p className="text-xs text-gray-500 mt-0.5">Breakdown by transaction status</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  stroke="#9ca3af"
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  stroke="#9ca3af"
                />
                <Tooltip
                  formatter={(value: number) => [value.toLocaleString(), 'Count']}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Peak Hours Analysis */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 lg:p-6 hover:shadow-md hover:border-gray-300 transition-all duration-200">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Peak Hours Analysis</h3>
          <p className="text-xs text-gray-500 mt-0.5">Transaction volume by time of day</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Morning', data: analytics.peakHours.morning, color: 'bg-amber-50 text-amber-600', icon: '🌅' },
            { label: 'Afternoon', data: analytics.peakHours.afternoon, color: 'bg-blue-50 text-blue-600', icon: '☀️' },
            { label: 'Evening', data: analytics.peakHours.evening, color: 'bg-green-50 text-green-600', icon: '🌆' },
            { label: 'Night', data: analytics.peakHours.night, color: 'bg-indigo-50 text-indigo-600', icon: '🌙' },
          ].map((period) => (
            <div
              key={period.label}
              className={`${period.color} p-4 rounded-xl border border-current/20`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{period.icon}</span>
                  <span className="font-semibold">{period.label}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold">{formatCurrency(period.data.earnings)}</p>
                <p className="text-xs opacity-75">{period.data.count} transactions</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

