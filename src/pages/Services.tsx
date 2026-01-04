import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Package,
  DollarSign,
  Star,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  TrendingUp,
  Tag,
  Clock,
  CheckCircle,
  X
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Card, Loader, EmptyState, RoundAvatar, PillBadge, ShowEntriesDropdown, StatCard, SearchBar } from '@/components/common';
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
import { servicesApi, approvalApi } from '@/api';
import { useToastContext } from '@/contexts/ToastContext';
import type { ApprovalRequest } from '@/types/approval';

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
  const toast = useToastContext();
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

  const [pendingApprovalRequests, setPendingApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [isLoadingPending, setIsLoadingPending] = useState(false);
  const [processingServiceId, setProcessingServiceId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchServicesRequest());
  }, [dispatch]);

  // Fetch service approval requests when pending filter is active
  useEffect(() => {
    if (filter === 'pending') {
      fetchPendingApprovalRequests();
    }
  }, [filter]);

  const fetchPendingApprovalRequests = async () => {
    setIsLoadingPending(true);
    try {
      const response = await approvalApi.getApprovalRequests({
        type: 'service_approval',
        status: 'pending',
        page: 1,
        limit: 100,
      });
      if (response.success && response.data) {
        setPendingApprovalRequests(response.data.requests);
      }
    } catch (error) {
      console.error('Failed to fetch pending approval requests:', error);
    } finally {
      setIsLoadingPending(false);
    }
  };

  // Handle service approval
  const handleApproveService = async (serviceId: string, approvalRequestId?: string) => {
    setProcessingServiceId(serviceId);
    try {
      if (approvalRequestId) {
        // Approve via approval request
        const response = await approvalApi.approveRequest(approvalRequestId);
        if (response.success) {
          toast.success('Service approved successfully');
          await fetchPendingApprovalRequests();
          dispatch(fetchServicesRequest());
        } else {
          toast.error(response.message || 'Failed to approve service');
        }
      } else {
        // Direct service approval
        const response = await servicesApi.approve(serviceId);
        if (response.success) {
          toast.success('Service approved successfully');
          dispatch(fetchServicesRequest());
        } else {
          toast.error(response.message || 'Failed to approve service');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve service');
    } finally {
      setProcessingServiceId(null);
    }
  };

  // Handle service rejection
  const handleRejectService = async (serviceId: string, approvalRequestId?: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason || !reason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }

    setProcessingServiceId(serviceId);
    try {
      if (approvalRequestId) {
        // Reject via approval request
        const response = await approvalApi.rejectRequest(approvalRequestId, reason);
        if (response.success) {
          toast.success('Service rejected');
          await fetchPendingApprovalRequests();
          dispatch(fetchServicesRequest());
        } else {
          toast.error(response.message || 'Failed to reject service');
        }
      } else {
        // Direct service rejection
        const response = await servicesApi.reject(serviceId);
        if (response.success) {
          toast.success('Service rejected');
          dispatch(fetchServicesRequest());
        } else {
          toast.error(response.message || 'Failed to reject service');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject service');
    } finally {
      setProcessingServiceId(null);
    }
  };

  // Merge services with approval requests for pending filter
  const getServicesWithApprovalInfo = () => {
    if (filter !== 'pending') {
      return services;
    }

    // Create a map of astrologer IDs to approval requests
    // For service approvals, we match by astrologerId since each astrologer can have multiple services
    const approvalMap = new Map<string, ApprovalRequest[]>();
    pendingApprovalRequests.forEach(req => {
      if (!approvalMap.has(req.astrologerId)) {
        approvalMap.set(req.astrologerId, []);
      }
      approvalMap.get(req.astrologerId)!.push(req);
    });

    // Merge services with their approval requests
    // Match inactive services with approval requests from the same astrologer
    return services.map(service => {
      const astrologerApprovals = approvalMap.get(service.astrologerId._id) || [];
      // For now, take the first pending approval request for this astrologer
      // In a real scenario, the backend should include serviceId in the approval request
      const approvalRequest = astrologerApprovals.find(req => req.requestType === 'service_approval') || null;
      
      return {
        ...service,
        approvalRequest,
      };
    });
  };

  // Client-side filtering
  const servicesWithApproval = getServicesWithApprovalInfo();
  const filteredServices = servicesWithApproval.filter(s => {
    // Apply status filter
    if (filter === 'active' && (!s.isActive || s.isDeleted)) return false;
    if (filter === 'inactive' && (s.isActive && !s.isDeleted)) return false;
    if (filter === 'pending') {
      // Show services that are inactive and have pending approval request
      if (s.isActive || s.isDeleted) return false;
      if (!(s as any).approvalRequest) return false;
    }
    
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
    if (filter === 'pending' && service.approvalRequest) {
      return <PillBadge variant="pending" label="Pending Approval" showDot={false} />;
    }
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
          <div className="w-full md:w-80">
            <SearchBar
              placeholder="Search services, astrologers..."
              value={search}
              onSearch={(query) => dispatch(setSearch(query))}
              onClear={() => dispatch(setSearch(''))}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
          <StatCard
            title="Total"
            value={stats.total}
            icon={Package}
          />
          <StatCard
            title="Active"
            value={stats.active}
            icon={CheckCircle2}
          />
          <StatCard
            title="Inactive"
            value={stats.inactive}
            icon={XCircle}
          />
          <StatCard
            title="Pending Approval"
            value={stats.pending || 0}
            icon={Clock}
          />
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon={TrendingUp}
          />
          <StatCard
            title="Avg Rating"
            value={stats.averageRating.toFixed(1)}
            icon={Star}
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
            { key: 'active', label: 'Active', count: stats.active },
            { key: 'inactive', label: 'Inactive', count: stats.inactive },
            { key: 'pending', label: 'Pending Approval', count: stats.pending || 0 },
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
        {(isLoading || (filter === 'pending' && isLoadingPending)) ? (
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
                          className="font-medium text-gray-900 hover:text-gray-700 transition-colors max-w-xs truncate block"
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
                            <span className="font-medium text-gray-900 hover:text-gray-700">
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
                          {filter === 'pending' && (service as any).approvalRequest ? (
                            <>
                              <button
                                onClick={() => handleApproveService(service._id, (service as any).approvalRequest?._id)}
                                disabled={processingServiceId === service._id}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRejectService(service._id, (service as any).approvalRequest?._id)}
                                disabled={processingServiceId === service._id}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Reject"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : null}
                          <Link
                            to={`${ROUTES.SERVICES}/${service._id}`}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {filter !== 'pending' && (
                            <button
                              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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
                        className="font-semibold text-gray-900 hover:text-gray-700"
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
                          <span className="text-sm text-gray-600 hover:text-gray-700">
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
                  <div className="flex items-center gap-2">
                    {filter === 'pending' && (service as any).approvalRequest ? (
                      <>
                        <button
                          onClick={() => handleApproveService(service._id, (service as any).approvalRequest?._id)}
                          disabled={processingServiceId === service._id}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Approve"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRejectService(service._id, (service as any).approvalRequest?._id)}
                          disabled={processingServiceId === service._id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Reject"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : null}
                    <Link
                      to={`${ROUTES.SERVICES}/${service._id}`}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile View - Optimized Mobile-First Design */}
            <div className="md:hidden space-y-3">
              {paginatedServices.map((service) => (
                <div
                  key={service._id}
                  className="border border-gray-200 rounded-xl bg-white overflow-hidden hover:border-gray-300 active:bg-gray-50 transition-all"
                >
                  {/* Header */}
                  <div className="p-3 border-b border-gray-100">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(service._id)}
                        onChange={() => handleSelectOne(service._id)}
                        className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <Link
                              to={`${ROUTES.SERVICES}/${service._id}`}
                              className="font-semibold text-base text-gray-900 truncate block hover:text-gray-700"
                            >
                              {service.name}
                            </Link>
                            <p className="text-xs text-gray-500 mt-0.5">{service.duration}</p>
                          </div>
                          {getStatusBadge(service)}
                        </div>
                        
                        {/* Service Info */}
                        <div className="mb-3 p-2 -mx-2 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors">
                          <p className="text-xs text-gray-500 mb-0.5">Category</p>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700">
                            <Tag className="w-3 h-3" />
                            {getCategoryLabel(service.category)}
                          </span>
                        </div>
                        
                        {/* Astrologer Info */}
                        {service.astrologerId && (
                          <Link 
                            to={`${ROUTES.ASTROLOGERS}/${service.astrologerId._id}`}
                            className="flex items-center gap-2 p-2 -mx-2 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
                          >
                            <RoundAvatar
                              src={service.astrologerId.profilePicture}
                              size="sm"
                              name={service.astrologerId.name}
                              isOnline={false}
                              className="flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500">Astrologer</p>
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {service.astrologerId.name}
                              </p>
                            </div>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="p-3 bg-gray-50/30">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-white p-2.5 rounded-lg border border-gray-100">
                        <p className="text-gray-500 text-xs mb-1">Price</p>
                        <p className="font-semibold text-sm text-gray-900">{formatCurrency(service.price)}</p>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-gray-100">
                        <p className="text-gray-500 text-xs mb-1">Bookings</p>
                        <p className="font-semibold text-base text-gray-900">{service.totalBookings || 0}</p>
                        <p className="text-xs text-gray-500 mt-0.5">({service.completedBookings || 0} completed)</p>
                      </div>
                    </div>
                    
                    <div className="bg-white p-2.5 rounded-lg border border-gray-100 mb-3">
                      <p className="text-gray-500 text-xs mb-1">Rating</p>
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold text-base text-gray-900">
                          {service.averageRating?.toFixed(1) || '0.0'}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({service.totalRatings || 0} reviews)
                        </span>
                      </div>
                    </div>
                    
                    {/* Footer Actions */}
                    <div className="flex gap-2">
                      {filter === 'pending' && (service as any).approvalRequest ? (
                        <>
                          <button
                            onClick={() => handleApproveService(service._id, (service as any).approvalRequest?._id)}
                            disabled={processingServiceId === service._id}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 active:bg-green-800 rounded-lg transition-colors touch-manipulation disabled:opacity-50"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectService(service._id, (service as any).approvalRequest?._id)}
                            disabled={processingServiceId === service._id}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg transition-colors touch-manipulation disabled:opacity-50"
                          >
                            <X className="w-4 h-4" />
                            Reject
                          </button>
                        </>
                      ) : (
                        <Link
                          to={`${ROUTES.SERVICES}/${service._id}`}
                          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors touch-manipulation"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </Link>
                      )}
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
