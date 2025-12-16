import { useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, Loader, EmptyState, Avatar, StatusBadge } from '@/components/common';
import { servicesApi } from '@/api';
import { Service } from '@/types';
import { formatCurrency, formatDateTime } from '@/utils/formatters';

export const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'active' | 'inactive'>('all');

  useEffect(() => {
    loadServices();
  }, [search, filter]);

  const loadServices = async () => {
    try {
      setIsLoading(true);
      const response = await servicesApi.getAll({ search, sortBy: 'createdAt', sortOrder: 'desc' });
      let data = response.data?.data || [];
      
      if (filter !== 'all') {
        data = data.filter(s => s.status === filter || (filter === 'active' && s.isActive) || (filter === 'inactive' && !s.isActive));
      }
      
      setServices(data);
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="Services Management"
        subtitle="Manage all astrologer services"
      />

      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="input w-48"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12">
            <Loader size="lg" text="Loading services..." />
          </div>
        ) : services.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No services found"
            description="No services match your current filters"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-y border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Astrologer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {services.map((service) => (
                  <tr key={service._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-900">{service.title}</p>
                      <p className="text-sm text-gray-500">{service.description.slice(0, 50)}...</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Avatar src={service.astrologerId.profilePicture} name={service.astrologerId.name} size="sm" />
                        <span className="text-sm text-gray-900">{service.astrologerId.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="badge bg-gray-100 text-gray-700">{service.category}</span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-900">{formatCurrency(service.price)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-900">{service.totalOrders}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-900">{service.rating.toFixed(1)} ⭐</p>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={service.status} />
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-500">{formatDateTime(service.createdAt)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </MainLayout>
  );
};

