import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Package,
  DollarSign,
  Star,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  TrendingUp,
  Tag
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Card, Loader, EmptyState, RoundAvatar, PillBadge, ShowEntriesDropdown, StatCard } from '@/components/common';
import { formatCurrency } from '@/utils/formatters';
import { RootState } from '@/store';
import {
  fetchServicesRequest,
  setFilter,
  setSearch,
  setEntriesPerPage,
  setCurrentPage,
  toggleSelection,
  selectAll,
  deselectAll,
  ServiceFilter,
} from '@/store/slices/servicesSlice';
import { ROUTES } from '@/utils/constants';

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
  const dispatch = useDispatch();
  const { 
    services, 
    isLoading, 
    filter, 
    search, 
    entriesPerPage, 
    currentPage, 
    selectedIds, 
    stats 
  } = useSelector((state: RootState) => state.services);

  useEffect(() => {
    dispatch(fetchServicesRequest());
  }, [dispatch]);

  // Client-side filtering
  const filteredServices = services.filter(s => {
    // Apply status filter
    if (filter === 'active' && (!s.isActive || s.isDeleted)) return false;
    if (filter === 'inactive' && (s.isActive && !s.isDeleted)) return false;
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        s.name?.toLowerCase().includes(searchLower) ||
        s.description?.toLowerCase().includes(searchLower) ||
        s.category?.toLowerCase().includes(searchLower) ||
        s.astrologerId?.name?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredServices.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const paginatedServices = filteredServices.slice(startIndex, endIndex);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      dispatch(selectAll(paginatedServices.map(s => s._id)));
    } else {
      dispatch(deselectAll());
    }
  };

  const handleSelectOne = (id: string) => {
    dispatch(toggleSelection(id));
  };

  const isAllSelected = paginatedServices.length > 0 && paginatedServices.every(s => selectedIds.has(s._id));
  const isSomeSelected = paginatedServices.some(s => selectedIds.has(s._id)) && !isAllSelected;

  // Helper functions
  const getStatusBadge = (service: any) => {
    if (!service.isActive || service.isDeleted) {
      return <PillBadge variant="inactive" label="Inactive" showDot={false} />;
    }
    return <PillBadge variant="active" label="Active" showDot={false} />;
  };

  const getCategoryLabel = (category: string) => {
    return categoryLabels[category] || category;
  };

  // Pagination helper
  const getPaginationNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Services</h1>
            <p className="text-gray-500 mt-1">Manage all astrologer services on the platform</p>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search services, astrologers..."
              value={search}
              onChange={(e) => dispatch(setSearch(e.target.value))}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            title="Total"
            value={stats.total}
            icon={Package}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title="Active"
            value={stats.active}
            icon={CheckCircle2}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <StatCard
            title="Inactive"
            value={stats.inactive}
            icon={XCircle}
            iconColor="text-gray-600"
            iconBgColor="bg-gray-100"
          />
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon={TrendingUp}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
          />
          <StatCard
            title="Avg Rating"
            value={stats.averageRating.toFixed(1)}
            icon={Star}
            iconColor="text-yellow-600"
            iconBgColor="bg-yellow-100"
          />
          <StatCard
            title="Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={DollarSign}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-100"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-8 overflow-x-auto">
          {[
            { key: 'all', label: 'All', count: stats.total },
            { key: 'active', label: 'Active', count: stats.active },
            { key: 'inactive', label: 'Inactive', count: stats.inactive },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => dispatch(setFilter(key as ServiceFilter))}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                filter === key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                filter === key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <Card>
        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={input => {
                if (input) input.indeterminate = isSomeSelected;
              }}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">
              {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select all'}
            </span>
            {selectedIds.size > 0 && (
              <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                Delete Selected
              </button>
            )}
          </div>
          <ShowEntriesDropdown
            value={entriesPerPage}
            onChange={(value) => dispatch(setEntriesPerPage(value))}
          />
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="py-12">
            <Loader size="lg" text="Loading services..." />
          </div>
        ) : filteredServices.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No services found"
            description="No services match your current filters"
          />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-y border-gray-200">
                  <tr>
                    <th className="w-12 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={input => {
                          if (input) input.indeterminate = isSomeSelected;
                        }}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Service</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Astrologer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Bookings</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rating</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedServices.map((service) => (
                    <tr key={service._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(service._id)}
                          onChange={() => handleSelectOne(service._id)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <Link
                          to={`${ROUTES.SERVICES}/${service._id}`}
                          className="font-medium text-gray-900 hover:text-blue-600 transition-colors max-w-xs truncate block"
                        >
                          {service.name}
                        </Link>
                        <p className="text-xs text-gray-500 mt-1">{service.duration}</p>
                      </td>
                      <td className="px-4 py-4">
                        {service.astrologerId ? (
                          <Link 
                            to={`${ROUTES.ASTROLOGERS}/${service.astrologerId._id}`}
                            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                          >
                            <RoundAvatar
                              src={service.astrologerId.profilePicture}
                              name={service.astrologerId.name}
                              size="sm"
                            />
                            <span className="font-medium text-gray-900 hover:text-blue-600">
                              {service.astrologerId.name}
                            </span>
                          </Link>
                        ) : (
                          <span className="text-gray-400 text-sm">No astrologer</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700">
                          <Tag className="w-3 h-3" />
                          {getCategoryLabel(service.category)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
                        {formatCurrency(service.price)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">
                          <span className="font-medium">{service.totalBookings || 0}</span>
                          <span className="text-gray-500 text-xs ml-1">
                            ({service.completedBookings || 0} completed)
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-medium text-gray-900">
                            {service.averageRating?.toFixed(1) || '0.0'}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({service.totalRatings || 0})
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">{getStatusBadge(service)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`${ROUTES.SERVICES}/${service._id}`}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tablet View */}
            <div className="hidden md:block lg:hidden space-y-3">
              {paginatedServices.map((service) => (
                <div
                  key={service._id}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-all"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(service._id)}
                    onChange={() => handleSelectOne(service._id)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Link
                        to={`${ROUTES.SERVICES}/${service._id}`}
                        className="font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {service.name}
                      </Link>
                      {service.astrologerId && (
                        <Link 
                          to={`${ROUTES.ASTROLOGERS}/${service.astrologerId._id}`}
                          className="flex items-center gap-2 hover:opacity-80"
                        >
                          <RoundAvatar
                            src={service.astrologerId.profilePicture}
                            name={service.astrologerId.name}
                            size="sm"
                          />
                          <span className="text-sm text-gray-600 hover:text-blue-600">
                            {service.astrologerId.name}
                          </span>
                        </Link>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                        {getCategoryLabel(service.category)}
                      </span>
                      <span className="font-semibold text-gray-900">{formatCurrency(service.price)}</span>
                      <span className="text-gray-600">{service.totalBookings || 0} bookings</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span>{service.averageRating?.toFixed(1) || '0.0'}</span>
                      </div>
                      {getStatusBadge(service)}
                    </div>
                  </div>
                  <Link
                    to={`${ROUTES.SERVICES}/${service._id}`}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
              {paginatedServices.map((service) => (
                <div
                  key={service._id}
                  className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(service._id)}
                      onChange={() => handleSelectOne(service._id)}
                      className="w-4 h-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <Link
                          to={`${ROUTES.SERVICES}/${service._id}`}
                          className="font-semibold text-gray-900 hover:text-blue-600"
                        >
                          {service.name}
                        </Link>
                        {getStatusBadge(service)}
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-purple-700 bg-purple-50 px-2 py-1 rounded">
                          {getCategoryLabel(service.category)}
                        </span>
                        <span className="text-xs text-gray-500">{service.duration}</span>
                      </div>
                      
                      {service.astrologerId && (
                        <Link 
                          to={`${ROUTES.ASTROLOGERS}/${service.astrologerId._id}`}
                          className="flex items-center gap-2 mb-3 hover:opacity-80"
                        >
                          <RoundAvatar
                            src={service.astrologerId.profilePicture}
                            name={service.astrologerId.name}
                            size="sm"
                          />
                          <div>
                            <p className="text-xs text-gray-500">Astrologer</p>
                            <p className="text-sm font-medium text-gray-900 hover:text-blue-600">
                              {service.astrologerId.name}
                            </p>
                          </div>
                        </Link>
                      )}
                      
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Price</p>
                          <p className="font-semibold text-gray-900">{formatCurrency(service.price)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Bookings</p>
                          <p className="font-medium text-gray-900">{service.totalBookings || 0}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Rating</p>
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                            <span className="font-medium text-gray-900">
                              {service.averageRating?.toFixed(1) || '0.0'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <Link
                          to={`${ROUTES.SERVICES}/${service._id}`}
                          className="flex items-center justify-center gap-2 w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredServices.length)} of {filteredServices.length} services
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => dispatch(setCurrentPage(currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {getPaginationNumbers().map((page, idx) =>
                      typeof page === 'number' ? (
                        <button
                          key={idx}
                          onClick={() => dispatch(setCurrentPage(page))}
                          className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      ) : (
                        <span key={idx} className="px-2 text-gray-400">
                          {page}
                        </span>
                      )
                    )}
                  </div>
                  <button
                    onClick={() => dispatch(setCurrentPage(currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </MainLayout>
  );
};
