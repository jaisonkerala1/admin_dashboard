import { useEffect, useMemo } from 'react';
import { MainLayout } from '@/components/layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, StatCard, Loader, Avatar } from '@/components/common';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchEarningsRequest, setPeriod } from '@/store/slices/earningsSlice';
import { EarningsPeriod } from '@/types/earnings';
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  AlertCircle,
  Phone,
  Video,
  MessageCircle,
  Flame,
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];

const TYPE_ICONS: { [key: string]: any } = {
  'Voice Calls': Phone,
  'Video Calls': Video,
  'Chat': MessageCircle,
  'Pooja': Flame,
};

const TYPE_COLORS: { [key: string]: string } = {
  'Voice Calls': 'text-green-600 bg-green-50',
  'Video Calls': 'text-blue-600 bg-blue-50',
  'Chat': 'text-amber-600 bg-amber-50',
  'Pooja': 'text-purple-600 bg-purple-50',
};

export const Earnings = () => {
  const dispatch = useAppDispatch();
  const { period, data, isLoading, error } = useAppSelector((s) => s.earnings);

  useEffect(() => {
    dispatch(fetchEarningsRequest({ period }));
  }, [dispatch, period]);

  const periodLabel = useMemo(() => {
    const map: Record<EarningsPeriod, string> = {
      today: 'Today',
      '7d': '7 Days',
      '1m': '1 Month',
      '3m': '3 Months',
      '1y': '1 Year',
    };
    return map[period];
  }, [period]);

  const periodOptions: { key: EarningsPeriod; label: string }[] = useMemo(
    () => [
      { key: 'today', label: 'Today' },
      { key: '7d', label: '7 Days' },
      { key: '1m', label: '1 Month' },
      { key: '3m', label: '3 Months' },
      { key: '1y', label: '1 Year' },
    ],
    []
  );

  // Prepare pie chart data
  const pieData = useMemo(() => {
    if (!data?.breakdown) return [];
    return data.breakdown.map((item) => ({
      name: item.type,
      value: item.amount,
    }));
  }, [data]);

  return (
    <MainLayout>
      <PageHeader
        title="Earnings"
        subtitle="Platform revenue, payouts, and financial insights"
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size="lg" text="Loading earnings data..." />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Period Selector */}
          <div className="border-b border-gray-200">
            <div className="flex gap-6 overflow-x-auto">
              {periodOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => {
                    dispatch(setPeriod(opt.key));
                    dispatch(fetchEarningsRequest({ period: opt.key }));
                  }}
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

          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title={`GMV (${periodLabel})`}
              value={formatCurrency(data.overview.gmv)}
              icon={DollarSign}
              trend={{
                value: Math.abs(data.overview.growthPercentage),
                isPositive: data.overview.growthPercentage >= 0,
              }}
            />
            <StatCard
              title={`Net Revenue (${periodLabel})`}
              value={formatCurrency(data.overview.netRevenue)}
              icon={Wallet}
            />
            <StatCard
              title={`Payouts (${periodLabel})`}
              value={formatCurrency(data.overview.payouts)}
              icon={CreditCard}
            />
            <StatCard
              title="Pending Payouts"
              value={formatCurrency(data.overview.pendingPayouts)}
              icon={AlertCircle}
            />
            <StatCard
              title={`Refunds (${periodLabel})`}
              value={formatCurrency(data.overview.refunds)}
              icon={TrendingDown}
            />
          </div>

          {/* Earnings Trend Chart */}
          <Card>
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold">Revenue Trend</h3>
              <p className="text-sm text-gray-600">GMV vs Net Revenue over time</p>
            </div>
            <div className="p-4">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={data.trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#888" tick={{ fontSize: 12 }} />
                  <YAxis
                    stroke="#888"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: any) => [`₹${value.toLocaleString()}`, '']}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '8px 12px',
                    }}
                    labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="gmv"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="GMV"
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="net"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Net Revenue"
                    dot={{ fill: '#3b82f6', r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="payouts"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name="Payouts"
                    dot={{ fill: '#8b5cf6', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="px-4 pb-4 grid grid-cols-3 gap-4 border-t border-gray-100 pt-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total GMV</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(data.overview.gmv)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Net Revenue (20%)</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(data.overview.netRevenue)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Growth</p>
                <div className="flex items-center gap-2">
                  {data.overview.growthPercentage >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  )}
                  <span
                    className={`text-2xl font-bold ${
                      data.overview.growthPercentage >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {data.overview.growthPercentage > 0 ? '+' : ''}
                    {data.overview.growthPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Revenue Breakdown & Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Breakdown by Type - Bar Chart */}
            <Card>
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold">Revenue by Type</h3>
                <p className="text-sm text-gray-600">Breakdown by consultation type</p>
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.breakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="type"
                      stroke="#888"
                      tick={{ fontSize: 11 }}
                      angle={-15}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      stroke="#888"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Revenue']}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="amount" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="px-4 pb-4 space-y-2">
                {data.breakdown.map((item) => {
                  const Icon = TYPE_ICONS[item.type] || DollarSign;
                  const colorClass = TYPE_COLORS[item.type] || 'text-gray-600 bg-gray-50';
                  return (
                    <div
                      key={item.type}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${colorClass}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{item.type}</p>
                          <p className="text-xs text-gray-500">{item.count} consultations</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          {formatCurrency(item.amount)}
                        </p>
                        <p className="text-xs text-gray-500">{item.percentage}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Pie Chart Distribution */}
            <Card>
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold">Revenue Distribution</h3>
                <p className="text-sm text-gray-600">Share by consultation type</p>
              </div>
              <div className="p-4 flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Top Earning Astrologers */}
          <Card>
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold">Top Earning Astrologers</h3>
              <p className="text-sm text-gray-600">Highest revenue contributors</p>
            </div>
            <div className="p-4">
              {data.topAstrologers.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No astrologers data available</p>
              ) : (
                <div className="space-y-3">
                  {data.topAstrologers.slice(0, 10).map((astrologer, index) => (
                    <div
                      key={astrologer._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-400 w-8">
                          #{index + 1}
                        </span>
                        <Avatar
                          src={astrologer.profilePicture}
                          name={astrologer.name}
                          size="sm"
                        />
                        <div>
                          <div className="font-semibold">{astrologer.name}</div>
                          <div className="text-xs text-gray-500">
                            {astrologer.consultations} consultations • ⭐{' '}
                            {astrologer.rating.toFixed(1)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          {formatCurrency(astrologer.totalGmv)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Net: {formatCurrency(astrologer.netContribution)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      ) : null}
    </MainLayout>
  );
};

