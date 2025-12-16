import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Search, 
  Filter, 
  Calendar,
  Clock,
  DollarSign,
  Users,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Eye,
  X,
  Phone,
  AlertCircle,
  History,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, Loader, EmptyState, Avatar } from '@/components/common';
import { PoojaRequest } from '@/types';
import { formatCurrency, formatDateTime, formatDate } from '@/utils/formatters';
import { RootState } from '@/store';
import { fetchRequestsRequest } from '@/store/slices/poojaRequestsSlice';

// Status colors - minimal flat design
const statusConfig = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle2 },
  inProgress: { label: 'In Progress', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: RefreshCw },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: XCircle },
};

export const PoojaRequests = () => {
  const dispatch = useDispatch();
  const { requests, pagination, isLoading } = useSelector((state: RootState) => state.poojaRequests);
  
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'inProgress' | 'completed' | 'cancelled'>('all');
  const [selectedRequest, setSelectedRequest] = useState<PoojaRequest | null>(null);

  useEffect(() => {
    const debounce = setTimeout(() => {
      dispatch(fetchRequestsRequest({ 
        page: 1, 
        search: search || undefined, 
        status: filter !== 'all' ? filter : undefined 
      }));
    }, 300);
    return () => clearTimeout(debounce);
  }, [search, filter, dispatch]);

  const handlePageChange = (newPage: number) => {
    dispatch(fetchRequestsRequest({ 
      page: newPage, 
      search: search || undefined, 
      status: filter !== 'all' ? filter : undefined 
    }));
  };

  const handleRefresh = () => {
    dispatch(fetchRequestsRequest({ 
      page: pagination.page, 
      search: search || undefined, 
      status: filter !== 'all' ? filter : undefined 
    }));
  };

  // Calculate stats
  const stats = {
    total: pagination.total,
    pending: requests.filter(r => r.status === 'pending').length,
    confirmed: requests.filter(r => r.status === 'confirmed').length,
    inProgress: requests.filter(r => r.status === 'inProgress').length,
    completed: requests.filter(r => r.status === 'completed').length,
    totalRevenue: requests.reduce((sum, r) => sum + (r.status === 'completed' ? r.price : 0), 0),
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border ${config.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  return (
    <MainLayout>
      <PageHeader
        title="Pooja Requests Management"
        subtitle={`Manage all service requests • ${pagination.total} total`}
      />

      {/* Stats Cards - Minimal Flat Design */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        <Card className="!p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-600">Total Requests</p>
            </div>
          </div>
        </Card>
        
        <Card className="!p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-xs text-gray-600">Pending</p>
            </div>
          </div>
        </Card>
        
        <Card className="!p-4 border-l-4 border-l-indigo-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.confirmed}</p>
              <p className="text-xs text-gray-600">Confirmed</p>
            </div>
          </div>
        </Card>
        
        <Card className="!p-4 border-l-4 border-l-purple-500">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              <p className="text-xs text-gray-600">In Progress</p>
            </div>
          </div>
        </Card>
        
        <Card className="!p-4 border-l-4 border-l-green-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              <p className="text-xs text-gray-600">Completed</p>
            </div>
          </div>
        </Card>
        
        <Card className="!p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-xs text-gray-600">Revenue</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        {/* Filters - Minimal Design */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer name, service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="inProgress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 border border-gray-300 rounded-md transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="py-12">
            <Loader size="lg" text="Loading requests..." />
          </div>
        ) : requests.length === 0 ? (
          <EmptyState
            icon={AlertCircle}
            title="No requests found"
            description="No pooja requests match your current filters"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-y border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Astrologer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Avatar name={request.customerName} size="sm" />
                          <div>
                            <p className="font-medium text-sm text-gray-900">{request.customerName}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {request.customerPhone}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-sm text-gray-900">{request.serviceName}</p>
                        <p className="text-xs text-gray-500">{request.serviceCategory}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Avatar 
                            src={request.astrologerId.profilePicture} 
                            name={request.astrologerId.name} 
                            size="sm" 
                          />
                          <div>
                            <p className="font-medium text-sm text-gray-900">{request.astrologerId.name}</p>
                            <p className="text-xs text-gray-500">{request.astrologerId.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-900 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {formatDate(request.requestedDate)}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {request.requestedTime}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-sm text-gray-900">
                          {formatCurrency(request.price, request.currency)}
                        </p>
                        <p className="text-xs text-gray-500">{request.paymentStatus}</p>
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} requests
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Detail Modal */}
      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </MainLayout>
  );
};

// Request Detail Modal - Minimal Flat Design
const RequestDetailModal = ({ 
  request, 
  onClose 
}: { 
  request: PoojaRequest; 
  onClose: () => void;
}) => {
  const config = statusConfig[request.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
        <div className="fixed inset-0 bg-black/40 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
            <h2 className="text-lg font-semibold text-gray-900">Request Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border ${config.color}`}>
                <StatusIcon className="w-4 h-4" />
                {config.label}
              </span>
              <span className="text-sm text-gray-500">ID: {request._id.slice(-8)}</span>
            </div>

            {/* Customer & Astrologer */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="!p-4">
                <p className="text-xs font-medium text-gray-500 mb-2">Customer</p>
                <div className="flex items-center gap-2 mb-2">
                  <Avatar name={request.customerName} size="md" />
                  <div>
                    <p className="font-medium text-gray-900">{request.customerName}</p>
                    <p className="text-sm text-gray-500">{request.customerPhone}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="!p-4">
                <p className="text-xs font-medium text-gray-500 mb-2">Astrologer</p>
                <div className="flex items-center gap-2 mb-2">
                  <Avatar 
                    src={request.astrologerId.profilePicture}
                    name={request.astrologerId.name} 
                    size="md" 
                  />
                  <div>
                    <p className="font-medium text-gray-900">{request.astrologerId.name}</p>
                    <p className="text-sm text-gray-500">{request.astrologerId.email}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Service Info */}
            <Card className="!p-4 border-l-4 border-l-indigo-500">
              <p className="text-xs font-medium text-gray-500 mb-2">Service Details</p>
              <p className="font-semibold text-gray-900 mb-1">{request.serviceName}</p>
              <p className="text-sm text-gray-600">{request.serviceCategory}</p>
            </Card>

            {/* Scheduling & Payment */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="!p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium">Scheduled For</span>
                </div>
                <p className="font-medium text-gray-900">{formatDate(request.requestedDate)}</p>
                <p className="text-sm text-gray-600">{request.requestedTime}</p>
              </Card>
              
              <Card className="!p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs font-medium">Payment</span>
                </div>
                <p className="font-bold text-lg text-gray-900">
                  {formatCurrency(request.price, request.currency)}
                </p>
                <p className="text-sm text-gray-600 capitalize">{request.paymentStatus}</p>
              </Card>
            </div>

            {/* Special Instructions */}
            {request.specialInstructions && (
              <Card className="!p-4 bg-amber-50 border-amber-200">
                <p className="text-xs font-medium text-amber-800 mb-2">Special Instructions</p>
                <p className="text-sm text-gray-700">{request.specialInstructions}</p>
              </Card>
            )}

            {/* Notes */}
            {request.notes && (
              <Card className="!p-4 bg-blue-50 border-blue-200">
                <p className="text-xs font-medium text-blue-800 mb-2">Admin Notes</p>
                <p className="text-sm text-gray-700">{request.notes}</p>
              </Card>
            )}

            {/* Status History */}
            <Card className="!p-4">
              <p className="text-xs font-medium text-gray-500 mb-3 flex items-center gap-2">
                <History className="w-4 h-4" />
                Status Timeline
              </p>
              <div className="space-y-3">
                {request.statusHistory.map((history, index) => (
                  <div key={history._id} className="flex items-start gap-3 relative">
                    {index < request.statusHistory.length - 1 && (
                      <div className="absolute left-2 top-6 w-0.5 h-full bg-gray-200" />
                    )}
                    <div className="w-4 h-4 rounded-full bg-indigo-500 flex-shrink-0 mt-0.5 z-10" />
                    <div>
                      <p className="font-medium text-sm capitalize text-gray-900">{history.status}</p>
                      <p className="text-xs text-gray-500">{formatDateTime(history.timestamp)}</p>
                      {history.notes && (
                        <p className="text-xs text-gray-600 mt-1">{history.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Meta */}
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 pt-4 border-t border-gray-200">
              <div>
                <span className="font-medium">Source:</span> {request.source}
              </div>
              <div>
                <span className="font-medium">Created:</span> {formatDateTime(request.createdAt)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

