import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, Loader } from '@/components/common';
import { analyticsApi } from '@/api';
import { RevenueData, GrowthData } from '@/api/analytics';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/utils/formatters';

export const Analytics = () => {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [growthData, setGrowthData] = useState<GrowthData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      
      if (dateRange === 'week') {
        startDate.setDate(endDate.getDate() - 7);
      } else if (dateRange === 'month') {
        startDate.setMonth(endDate.getMonth() - 1);
      } else {
        startDate.setFullYear(endDate.getFullYear() - 1);
      }

      const [revenueResponse, growthResponse] = await Promise.all([
        analyticsApi.getRevenue({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          groupBy: dateRange === 'week' ? 'day' : dateRange === 'month' ? 'day' : 'month',
        }),
        analyticsApi.getGrowth({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          groupBy: dateRange === 'week' ? 'day' : dateRange === 'month' ? 'day' : 'month',
        }),
      ]);

      setRevenueData(revenueResponse.data || []);
      setGrowthData(growthResponse.data || []);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="Analytics"
        subtitle="Platform-wide analytics and insights"
        action={
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="input w-48"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size="lg" text="Loading analytics..." />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Revenue Chart */}
          <Card title="Revenue Overview">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip
                  formatter={(value: any) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                />
                <Legend />
                <Line type="monotone" dataKey="consultations" stroke="#0ea5e9" strokeWidth={2} name="Consultations" />
                <Line type="monotone" dataKey="services" stroke="#8b5cf6" strokeWidth={2} name="Services" />
                <Line type="monotone" dataKey="liveStreams" stroke="#ef4444" strokeWidth={2} name="Live Streams" />
                <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} name="Total Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Growth Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="User & Astrologer Growth">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Bar dataKey="users" fill="#0ea5e9" name="Users" />
                  <Bar dataKey="astrologers" fill="#8b5cf6" name="Astrologers" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Consultation Growth">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Bar dataKey="consultations" fill="#10b981" name="Consultations" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

