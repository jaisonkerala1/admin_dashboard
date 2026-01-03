import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Clock,
  DollarSign,
  Users,
  CheckCircle2,
  XCircle,
  Trash2,
  Activity,
  AlertCircle,
  Plus
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Card, Loader, EmptyState, RoundAvatar, PillBadge, ShowEntriesDropdown, StatCard, SearchBar } from '@/components/common';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { getImageUrl } from '@/utils/helpers';
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

export const ServiceRequests = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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

  const handleServiceClick = (requestId: string, serviceId: string | null | undefined, e: React.MouseEvent) => {
    // Prevent navigation if clicking on checkbox, action buttons, or links
    const target = e.target as HTMLElement;
    if (
      target.closest('input[type="checkbox"]') ||
      target.closest('button') ||
      target.closest('a') ||
      target.closest('[role="button"]')
    ) {
      return;
    }
    
    // Navigate to service detail if serviceId exists, otherwise navigate to service request detail
    if (serviceId) {
      navigate(`${ROUTES.SERVICES}/${serviceId}`);
    } else {
      navigate(`${ROUTES.SERVICE_REQUESTS}/${requestId}`);
    }
  };

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
    return <PillBadge variant={status as any} label={config.label} showDot={false} />;
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
            <div className="w-full sm:w-80">
              <SearchBar
                placeholder="Search customer, service..."
                value={search}
                onSearch={(query) => dispatch(setSearch(query))}
                onClear={() => dispatch(setSearch(''))}
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
          />
          <StatCard
            title="Pending"
            value={stats.pending}
            icon={Clock}
          />
          <StatCard
            title="Confirmed"
            value={stats.confirmed}
            icon={CheckCircle2}
          />
          <StatCard
            title="In Progress"
            value={stats.inProgress}
            icon={Activity}
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={CheckCircle2}
          />
          <StatCard
            title="Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={DollarSign}
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

      {/* Selection Controls */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
      </Card>

      {/* Loading State */}
      {isLoading ? (
        <div className="py-12">
          <Loader size="lg" text="Loading service requests..." />
        </div>
      ) : filteredRequests.length === 0 ? (
        <Card>
          <EmptyState
            icon={AlertCircle}
            title="No service requests found"
            description="No service requests match your current filters"
          />
        </Card>
      ) : (
        <>
          {/* Service Request Cards - Ad Centre Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedRequests.map((request) => (
                <div
                  key={request._id}
                  onClick={(e) => handleServiceClick(request._id, request.serviceId, e)}
                  className="cursor-pointer"
                >
                  <Card className="hover:shadow-md transition-all h-full">
                    {/* Header with Checkbox and Status */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(request._id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelectOne(request._id);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0 mt-0.5"
                        />
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {request.astrologerId?.profilePicture ? (
                            <img
                              src={getImageUrl(request.astrologerId.profilePicture) || ''}
                              alt={request.astrologerId.name}
                              className="w-10 h-10 rounded-full object-cover border border-gray-200 flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fallback = e.currentTarget.nextElementSibling;
                                if (fallback) {
                                  (fallback as HTMLElement).style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 flex-shrink-0 ${request.astrologerId?.profilePicture ? 'hidden' : ''}`}
                          >
                            <span className="text-gray-600 font-semibold text-sm">
                              {request.astrologerId?.name?.charAt(0).toUpperCase() || request.customerName?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm truncate">
                              {request.customerName || 'Unknown Customer'}
                            </h3>
                            <p className="text-xs text-gray-500 truncate">{request.customerPhone || 'No phone'}</p>
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>

                    {/* Service Info */}
                    <div className="mb-4 pb-4 border-b border-gray-100">
                      <Link
                        to={request.serviceId ? `${ROUTES.SERVICES}/${request.serviceId}` : '#'}
                        onClick={(e) => e.stopPropagation()}
                        className="block"
                      >
                        <p className="text-xs text-gray-500 mb-1">Service</p>
                        <p className="font-medium text-sm text-gray-900 truncate">{request.serviceName || 'N/A'}</p>
                        {request.serviceCategory && (
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{request.serviceCategory}</p>
                        )}
                      </Link>
                    </div>

                    {/* Astrologer Info */}
                    {request.astrologerId && (
                      <div className="mb-4 pb-4 border-b border-gray-100">
                        <Link
                          to={`${ROUTES.ASTROLOGERS}/${request.astrologerId._id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2"
                        >
                          <RoundAvatar
                            src={getImageUrl(request.astrologerId.profilePicture)}
                            size="sm"
                            name={request.astrologerId.name}
                            isOnline={false}
                            className="flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500">Astrologer</p>
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {request.astrologerId.name}
                            </p>
                          </div>
                        </Link>
                      </div>
                    )}

                    {/* Details */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Price:</span>
                        <span className="font-medium text-gray-900">{formatCurrency(request.price)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Requested:</span>
                        <span className="font-medium text-gray-900">{formatDate(request.requestedDate)}</span>
                      </div>
                      {request.requestedTime && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Time:</span>
                          <span className="font-medium text-gray-700">{request.requestedTime}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                      <Link
                        to={`${ROUTES.SERVICE_REQUESTS}/${request._id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors text-center"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Delete handler can be added here
                        }}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Card>
                </div>
              ))}
            </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Card>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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
            </Card>
          )}
        </>
      )}
    </MainLayout>
  );
};
