import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, Loader, Avatar } from '@/components/common';
import { analyticsApi } from '@/api';
import { AnalyticsData } from '@/types';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  DollarSign, TrendingUp, Users, UserCog, Star, ShoppingBag, 
  Radio, CheckCircle
} from 'lucide-react';
import { getImageUrl } from '@/utils/helpers';

const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

export const Analytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await analyticsApi.getAnalytics(period);
      console.log('📦 Analytics API Response:', response);
      
      // API returns { success, data: { overview, trends, ... } }
      if (response?.data) {
        console.log('✅ Analytics Data:', response.data);
        setData(response.data);
      } else {
        console.warn('⚠️ No data in response:', response);
      }
    } catch (err) {
      console.error('❌ Failed to load analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <Loader size="lg" text="Loading analytics..." />
        </div>
      </MainLayout>
    );
  }

  if (!data || !data.overview || !data.trends || !data.topPerformers || !data.distributions) {
    return (
      <MainLayout>
        <PageHeader
          title="Analytics"
          subtitle="Comprehensive platform analytics and insights"
        />
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-500">No analytics data available</p>
        </div>
      </MainLayout>
    );
  }

  const { overview, trends, topPerformers, distributions } = data;

  // Format revenue trend data for charts
  const revenueTrendData = (trends.revenue || []).map(item => ({
    date: item._id,
    revenue: item.revenue || 0,
    count: item.count || 0
  }));

  // Format growth trend data
  const growthTrendData = (trends.consultations || []).map((item, index) => ({
    date: item._id,
    consultations: item.count || 0,
    users: (trends.users || [])[index]?.count || 0,
    astrologers: (trends.astrologers || [])[index]?.count || 0
  }));

  // Format consultation status distribution for pie chart
  const consultationStatusData = (distributions.consultationStatus || []).map(item => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    value: item.count
  }));

  // Format review ratings distribution for bar chart
  const reviewRatingsData = (distributions.reviewRatings || []).map(item => ({
    rating: `${item._id} ⭐`,
    count: item.count
  }));

  return (
    <MainLayout>
      <PageHeader
        title="Analytics"
        subtitle="Comprehensive platform analytics and insights"
        action={
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="input w-48"
          >
            <option value="daily">Daily View</option>
            <option value="weekly">Weekly View</option>
            <option value="monthly">Monthly View</option>
          </select>
        }
      />

      <div className="space-y-6">
        {/* ============================================ */}
        {/* OVERVIEW STATS */}
        {/* ============================================ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue Stats */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Revenue</span>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold">₹{overview.revenue.total.toLocaleString()}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">This Month: ₹{overview.revenue.month.toLocaleString()}</span>
              {overview.revenue.growth > 0 && (
                <span className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {overview.revenue.growth}%
                </span>
              )}
            </div>
          </Card>

          {/* Consultations */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Consultations</span>
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">{overview.consultations.total}</div>
            <div className="text-xs text-gray-500 mt-1">
              {overview.consultations.completionRate}% completion rate
            </div>
          </Card>

          {/* Astrologers */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Astrologers</span>
              <UserCog className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold">{overview.astrologers.total}</div>
            <div className="text-xs text-gray-500 mt-1">
              {overview.astrologers.activeRate}% active
            </div>
          </Card>

          {/* Reviews */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Average Rating</span>
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold">{overview.reviews.averageRating} ⭐</div>
            <div className="text-xs text-gray-500 mt-1">
              {overview.reviews.total} total reviews
            </div>
          </Card>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Users</span>
              <Users className="w-5 h-5 text-cyan-600" />
            </div>
            <div className="text-2xl font-bold">{overview.users.total}</div>
            <div className="text-xs text-gray-500 mt-1">
              {overview.users.active} active users
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Services</span>
              <ShoppingBag className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold">{overview.services.total}</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Live Streams</span>
              <Radio className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-2xl font-bold">{overview.liveStreams.total}</div>
            <div className="text-xs text-gray-500 mt-1">
              {overview.liveStreams.active} currently live
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Weekly Revenue</span>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold">₹{overview.revenue.week.toLocaleString()}</div>
          </Card>
        </div>

        {/* ============================================ */}
        {/* REVENUE TREND CHART */}
        {/* ============================================ */}
        <Card>
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold">Revenue Trend</h3>
            <p className="text-sm text-gray-600">Revenue over time</p>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={revenueTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" tickFormatter={(value) => `₹${value.toLocaleString()}`} />
                <Tooltip
                  formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e0e0e0', 
                    borderRadius: '8px' 
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  name="Revenue" 
                  dot={{ fill: '#10b981', r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#0ea5e9" 
                  strokeWidth={2} 
                  name="Consultations" 
                  dot={{ fill: '#0ea5e9', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* ============================================ */}
        {/* GROWTH TRENDS */}
        {/* ============================================ */}
        <Card>
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold">Growth Trends</h3>
            <p className="text-sm text-gray-600">Users, astrologers, and consultations growth</p>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={growthTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e0e0e0', 
                    borderRadius: '8px' 
                  }}
                />
                <Legend />
                <Bar dataKey="consultations" fill="#10b981" name="Consultations" />
                <Bar dataKey="astrologers" fill="#8b5cf6" name="Astrologers" />
                <Bar dataKey="users" fill="#0ea5e9" name="Users" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* ============================================ */}
        {/* TOP PERFORMERS & DISTRIBUTIONS */}
        {/* ============================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Astrologers */}
          <Card>
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold">Top Earning Astrologers</h3>
              <p className="text-sm text-gray-600">Highest revenue generators</p>
            </div>
            <div className="p-4">
              {topPerformers.astrologers.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No data available</p>
              ) : (
                <div className="space-y-3">
                  {topPerformers.astrologers.slice(0, 5).map((astrologer, index) => (
                    <div key={astrologer._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-400 w-6">#{index + 1}</span>
                        <Avatar 
                          src={astrologer.profilePicture ? getImageUrl(astrologer.profilePicture) : undefined}
                          alt={astrologer.name}
                          size="sm"
                        />
                        <div>
                          <div className="font-semibold">{astrologer.name}</div>
                          <div className="text-xs text-gray-500">{astrologer.specialty || 'Astrologer'}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">₹{astrologer.totalEarnings.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{astrologer.totalConsultations} consultations</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Consultation Status Distribution */}
          <Card>
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold">Consultation Status</h3>
              <p className="text-sm text-gray-600">Distribution by status</p>
            </div>
            <div className="p-4">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={consultationStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {consultationStatusData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* ============================================ */}
        {/* TOP SERVICES & REVIEW RATINGS */}
        {/* ============================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Services */}
          <Card>
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold">Popular Services</h3>
              <p className="text-sm text-gray-600">Most booked services</p>
            </div>
            <div className="p-4">
              {topPerformers.services.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No service bookings yet</p>
              ) : (
                <div className="space-y-3">
                  {topPerformers.services.slice(0, 10).map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-400 w-6">#{index + 1}</span>
                        <div>
                          <div className="font-semibold">{service._id}</div>
                          <div className="text-xs text-gray-500">{service.bookings} bookings</div>
                        </div>
                      </div>
                      <div className="font-bold text-green-600">₹{service.revenue.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Review Ratings Distribution */}
          <Card>
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold">Review Ratings</h3>
              <p className="text-sm text-gray-600">Distribution of ratings</p>
            </div>
            <div className="p-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reviewRatingsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="rating" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e0e0e0', 
                      borderRadius: '8px' 
                    }}
                  />
                  <Bar dataKey="count" fill="#f59e0b" name="Reviews" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};
