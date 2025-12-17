import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Calendar,
  Clock,
  DollarSign,
  Users,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  Activity,
  AlertCircle,
  Plus
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Card, Loader, EmptyState, RoundAvatar, PillBadge, ShowEntriesDropdown, StatCard } from '@/components/common';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { RootState } from '@/store';
import {
  fetchRequestsRequest,
  setFilter,
  setSearch,
  setEntriesPerPage,
  setCurrentPage,
  toggleSelection,
  selectAll,
  deselectAll,
  ServiceRequestFilter,
} from '@/store/slices/poojaRequestsSlice';
import { ROUTES } from '@/utils/constants';

// Status colors - minimal flat design
const statusConfig = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle2 },
  inProgress: { label: 'In Progress', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Activity },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: XCircle },
};

type FilterTab = 'all' | 'pending' | 'confirmed' | 'inProgress' | 'completed' | 'cancelled';

export const ServiceRequests = () => {
  const dispatch = useDispatch();
  const { 
    requests, 
    isLoading, 
    filter, 
    search, 
    entriesPerPage, 
    currentPage, 
    selectedIds, 
    stats 
  } = useSelector((state: RootState) => state.poojaRequests);

  useEffect(() => {
    dispatch(fetchRequestsRequest());
  }, [dispatch]);

  // Client-side filtering
  const filteredRequests = requests.filter(r => {
    // Apply status filter
    if (filter !== 'all' && r.status !== filter) return false;
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        r.customerName?.toLowerCase().includes(searchLower) ||
        r.customerPhone?.toLowerCase().includes(searchLower) ||
        r.serviceName?.toLowerCase().includes(searchLower) ||
        r.astrologerId?.name?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      dispatch(selectAll(paginatedRequests.map(r => r._id)));
    } else {
      dispatch(deselectAll());
    }
  };

  const handleSelectOne = (id: string) => {
    dispatch(toggleSelection(id));
  };

  const isAllSelected = paginatedRequests.length > 0 && paginatedRequests.every(r => selectedIds.has(r._id));
  const isSomeSelected = paginatedRequests.some(r => selectedIds.has(r._id)) && !isAllSelected;

  // Helper functions
  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <PillBadge variant={status as any} label={config.label} icon={config.icon} showDot={false} />;
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
            <h1 className="text-3xl font-bold text-gray-900">Service Requests</h1>
            <p className="text-gray-500 mt-1">Manage all service requests on the platform</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Bar */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search customer, service..."
                value={search}
                onChange={(e) => dispatch(setSearch(e.target.value))}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            
            {/* Create Request Button */}
            <Link
              to={`${ROUTES.SERVICE_REQUESTS}/create`}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Create Request
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            title="Total"
            value={stats.total}
            icon={Users}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title="Pending"
            value={stats.pending}
            icon={Clock}
            iconColor="text-amber-600"
            iconBgColor="bg-amber-100"
          />
          <StatCard
            title="Confirmed"
            value={stats.confirmed}
            icon={CheckCircle2}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title="In Progress"
            value={stats.inProgress}
            icon={Activity}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={CheckCircle2}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
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
            { key: 'pending', label: 'Pending', count: stats.pending },
            { key: 'confirmed', label: 'Confirmed', count: stats.confirmed },
            { key: 'inProgress', label: 'In Progress', count: stats.inProgress },
            { key: 'completed', label: 'Completed', count: stats.completed },
            { key: 'cancelled', label: 'Cancelled', count: stats.cancelled },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => dispatch(setFilter(key as ServiceRequestFilter))}
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
            <Loader size="lg" text="Loading service requests..." />
          </div>
        ) : filteredRequests.length === 0 ? (
          <EmptyState
            icon={AlertCircle}
            title="No service requests found"
            description="No service requests match your current filters"
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
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Service</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Astrologer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Requested</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedRequests.map((request) => (
                    <tr key={request._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(request._id)}
                          onChange={() => handleSelectOne(request._id)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{request.customerName}</p>
                          <p className="text-sm text-gray-500">{request.customerPhone}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <Link
                            to={request.serviceId ? `${ROUTES.SERVICES}/${request.serviceId}` : '#'}
                            className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                          >
                            {request.serviceName}
                          </Link>
                          <p className="text-xs text-gray-500">{request.serviceCategory}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {request.astrologerId ? (
                          <Link 
                            to={`${ROUTES.ASTROLOGERS}/${request.astrologerId._id}`}
                            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                          >
                            <RoundAvatar
                              src={request.astrologerId.profilePicture}
                              alt={request.astrologerId.name}
                              size="sm"
                              showOnline={false}
                            />
                            <span className="font-medium text-gray-900 hover:text-blue-600">
                              {request.astrologerId.name}
                            </span>
                          </Link>
                        ) : (
                          <span className="text-gray-400 text-sm">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(request.requestedDate)}
                          </p>
                          <p className="text-xs text-gray-500">{request.requestedTime}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
                        {formatCurrency(request.price)}
                      </td>
                      <td className="px-4 py-4">{getStatusBadge(request.status)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`${ROUTES.SERVICE_REQUESTS}/${request._id}`}
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
              {paginatedRequests.map((request) => (
                <div
                  key={request._id}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-all"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(request._id)}
                    onChange={() => handleSelectOne(request._id)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold text-gray-900">{request.customerName}</p>
                      {request.astrologerId && (
                        <Link 
                          to={`${ROUTES.ASTROLOGERS}/${request.astrologerId._id}`}
                          className="flex items-center gap-2 hover:opacity-80"
                        >
                          <RoundAvatar
                            src={request.astrologerId.profilePicture}
                            alt={request.astrologerId.name}
                            size="xs"
                            showOnline={false}
                          />
                          <span className="text-sm text-gray-600 hover:text-blue-600">
                            {request.astrologerId.name}
                          </span>
                        </Link>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <Link
                        to={request.serviceId ? `${ROUTES.SERVICES}/${request.serviceId}` : '#'}
                        className="text-gray-900 hover:text-blue-600 font-medium"
                      >
                        {request.serviceName}
                      </Link>
                      <span className="text-gray-600">{formatDate(request.requestedDate)}</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(request.price)}
                      </span>
                      {getStatusBadge(request.status)}
                    </div>
                  </div>
                  <Link
                    to={`${ROUTES.SERVICE_REQUESTS}/${request._id}`}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
              {paginatedRequests.map((request) => (
                <div
                  key={request._id}
                  className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(request._id)}
                      onChange={() => handleSelectOne(request._id)}
                      className="w-4 h-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-900">{request.customerName}</p>
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-sm text-gray-500 mb-3">{request.customerPhone}</p>
                      
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Service</p>
                        <Link
                          to={request.serviceId ? `${ROUTES.SERVICES}/${request.serviceId}` : '#'}
                          className="font-medium text-gray-900 hover:text-blue-600"
                        >
                          {request.serviceName}
                        </Link>
                        <p className="text-xs text-gray-500">{request.serviceCategory}</p>
                      </div>
                      
                      {request.astrologerId && (
                        <Link 
                          to={`${ROUTES.ASTROLOGERS}/${request.astrologerId._id}`}
                          className="flex items-center gap-2 mb-3 hover:opacity-80"
                        >
                          <RoundAvatar
                            src={request.astrologerId.profilePicture}
                            alt={request.astrologerId.name}
                            size="sm"
                            showOnline={false}
                          />
                          <div>
                            <p className="text-xs text-gray-500">Astrologer</p>
                            <p className="text-sm font-medium text-gray-900 hover:text-blue-600">
                              {request.astrologerId.name}
                            </p>
                          </div>
                        </Link>
                      )}
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Requested</p>
                          <p className="font-medium text-gray-900">{formatDate(request.requestedDate)}</p>
                          <p className="text-xs text-gray-500">{request.requestedTime}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Price</p>
                          <p className="font-semibold text-gray-900">{formatCurrency(request.price)}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <Link
                          to={`${ROUTES.SERVICE_REQUESTS}/${request._id}`}
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
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredRequests.length)} of {filteredRequests.length} requests
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
