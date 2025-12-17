import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Package,
  DollarSign,
  Star,
  CheckCircle2,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  TrendingUp,
  RefreshCw,
  Calendar,
  Tag
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, Loader, EmptyState, Avatar } from '@/components/common';
import { servicesApi } from '@/api';
import { Service } from '@/types';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { ROUTES } from '@/utils/constants';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const categoryLabels: Record<string, string> = {
  reiki_healing: 'Reiki Healing',
  tarot_reading: 'Tarot Reading',
  numerology: 'Numerology',
  vastu_consultation: 'Vastu Consultation',
  kundli_matching: 'Kundli Matching',
  gemstone_consultation: 'Gemstone Consultation',
  horoscope_analysis: 'Horoscope Analysis',
  palm_reading: 'Palm Reading',
  face_reading: 'Face Reading',
  other: 'Other'
};

export const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalBookings: 0,
    totalRevenue: 0
  });

  const loadServices = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      const params: any = { 
        page, 
        limit: pagination.limit,
        sortBy: 'createdAt', 
        sortOrder: 'desc' 
      };
      
      if (search) params.search = search;
      if (filter !== 'all') params.isActive = filter === 'active';
      
      const response = await servicesApi.getAll(params);
      
      const servicesData = response.data || [];
      setServices(servicesData);
      
      if (response.pagination) {
        setPagination(response.pagination);
      }
      
      // Calculate stats
      const revenue = servicesData.reduce((sum: number, s: Service) => sum + (s.price * s.totalBookings), 0);
      const activeCount = servicesData.filter(s => s.isActive && !s.isDeleted).length;
      setStats({
        total: response.pagination?.total || servicesData.length,
        active: activeCount,
        inactive: servicesData.length - activeCount,
        totalBookings: servicesData.reduce((sum: number, s: Service) => sum + s.totalBookings, 0),
        totalRevenue: revenue
      });
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setIsLoading(false);
    }
  }, [search, filter, pagination.limit]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      loadServices(1);
    }, 300);
    return () => clearTimeout(debounce);
  }, [search, filter]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      loadServices(newPage);
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="Services Management"
        subtitle={`Manage all astrologer services • ${pagination.total} total`}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="!p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">{pagination.total}</p>
              <p className="text-xs text-blue-600">Total</p>
            </div>
          </div>
        </Card>
        
        <Card className="!p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-900">
                {services.filter(s => s.isActive && !s.isDeleted).length}
              </p>
              <p className="text-xs text-green-600">Active</p>
            </div>
          </div>
        </Card>
        
        <Card className="!p-4 bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-500 rounded-lg">
              <XCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {services.filter(s => !s.isActive || s.isDeleted).length}
              </p>
              <p className="text-xs text-gray-600">Inactive</p>
            </div>
          </div>
        </Card>
        
        <Card className="!p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-900">{stats.totalBookings}</p>
              <p className="text-xs text-purple-600">Bookings</p>
            </div>
          </div>
        </Card>
        
        <Card className="!p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 rounded-lg">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-900">
                {formatCurrency(stats.totalRevenue)}
              </p>
              <p className="text-xs text-emerald-600">Revenue</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <button
            onClick={() => loadServices(pagination.page)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Table */}
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
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-y border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Astrologer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bookings</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {services.map((service) => (
                    <tr key={service._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{service.name}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">{service.description}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar 
                            src={service.astrologerId.profilePicture} 
                            name={service.astrologerId.name} 
                            size="sm" 
                          />
                          <div>
                            <p className="font-medium text-gray-900">{service.astrologerId.name}</p>
                            <p className="text-sm text-gray-500">{service.astrologerId.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                          <Tag className="w-3 h-3" />
                          {categoryLabels[service.category] || service.category}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(service.price, service.currency || 'INR')}
                        </p>
                        <p className="text-xs text-gray-500">{service.duration}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-900">{service.totalBookings}</p>
                        <p className="text-xs text-gray-500">{service.completedBookings} completed</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="font-medium text-sm">
                            {service.averageRating > 0 ? service.averageRating.toFixed(1) : 'N/A'}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({service.totalRatings})
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {service.isActive && !service.isDeleted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <XCircle className="w-3 h-3" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <Link
                          to={`${ROUTES.SERVICES}/${service._id}`}
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} services
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                          pagination.page === pageNum
                            ? 'bg-indigo-600 text-white'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </Card>
    </MainLayout>
  );
}; 
