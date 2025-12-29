import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  ArrowLeft,
  ClipboardList,
  Calendar,
  Package,
  CheckCircle,
  AlertCircle,
  DollarSign,
  User,
  Phone,
  Clock
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Card, Loader, Avatar, Modal } from '@/components/common';
import { poojaRequestsApi } from '@/api';
import { PoojaRequest } from '@/types';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { useToastContext } from '@/contexts/ToastContext';
import { ROUTES, SERVICE_REQUEST_STATUS } from '@/utils/constants';

export const ServiceRequestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToastContext();
  const [request, setRequest] = useState<PoojaRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadRequest();
    }
  }, [id]);

  const loadRequest = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const response = await poojaRequestsApi.getById(id);
      setRequest(response.data || null);
    } catch (err) {
      console.error('Failed to load service request:', err);
      toast.error('Failed to load service request details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!id || !request) return;
    try {
      setIsUpdating(true);
      await poojaRequestsApi.updateStatus(id, status);
      await loadRequest();
      toast.success(`Service request ${status.toLowerCase()} successfully!`);
    } catch (err: any) {
      console.error('Failed to update status:', err);
      toast.error(err?.message || 'Failed to update service request');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    try {
      setIsUpdating(true);
      await poojaRequestsApi.updateStatus(id, SERVICE_REQUEST_STATUS.CANCELLED);
      await loadRequest();
      toast.success('Service request cancelled successfully!');
      setShowCancelModal(false);
    } catch (err: any) {
      console.error('Failed to cancel:', err);
      toast.error(err?.message || 'Failed to cancel service request');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case SERVICE_REQUEST_STATUS.PENDING: return 'bg-yellow-100 text-yellow-700';
      case SERVICE_REQUEST_STATUS.CONFIRMED: return 'bg-green-100 text-green-700';
      case SERVICE_REQUEST_STATUS.IN_PROGRESS: return 'bg-blue-100 text-blue-700';
      case SERVICE_REQUEST_STATUS.COMPLETED: return 'bg-purple-100 text-purple-700';
      case SERVICE_REQUEST_STATUS.CANCELLED: return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader size="lg" text="Loading service request details..." />
        </div>
      </MainLayout>
    );
  }

  if (!request) {
    return (
      <MainLayout>
        <Card>
          <div className="text-center py-12">
            <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Service Request Not Found</h3>
            <p className="text-gray-600 mb-6">The service request you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate(ROUTES.SERVICE_REQUESTS)}
              className="btn btn-primary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Service Requests
            </button>
          </div>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(ROUTES.SERVICE_REQUESTS)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-gray-500">
                Service Request ID: <span className="font-mono">{request._id}</span>
              </span>
              <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                {request.status.charAt(0).toUpperCase() + request.status.slice(1).replace('_', ' ')}
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {request.serviceName}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Service Info */}
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Service Information
                  </h3>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <Package className="w-10 h-10 text-gray-400" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {request.serviceName}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {request.serviceCategory}
                      </p>
                    </div>
                    {request.serviceId && (
                      <Link 
                        to={`${ROUTES.SERVICES}/${request.serviceId}`} 
                        className="text-sm text-primary-600 font-medium hover:text-primary-700"
                      >
                        View Service →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Request Details */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Request Details
              </h3>
              {request.specialInstructions ? (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Special Instructions:</p>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{request.specialInstructions}</p>
                </div>
              ) : (
                <p className="text-gray-500 italic">No special instructions provided.</p>
              )}
              {request.notes && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700 mb-2">Admin Notes:</p>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{request.notes}</p>
                </div>
              )}
            </Card>

            {/* Admin Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Actions
              </h3>
              <div className="space-y-2">
                {request.status === SERVICE_REQUEST_STATUS.PENDING && (
                  <button
                    onClick={() => handleUpdateStatus(SERVICE_REQUEST_STATUS.CONFIRMED)}
                    disabled={isUpdating}
                    className="w-full px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {isUpdating ? 'Confirming...' : 'Confirm Request'}
                  </button>
                )}
                {request.status === SERVICE_REQUEST_STATUS.CONFIRMED && (
                  <button
                    onClick={() => handleUpdateStatus(SERVICE_REQUEST_STATUS.IN_PROGRESS)}
                    disabled={isUpdating}
                    className="w-full px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {isUpdating ? 'Starting...' : 'Start Service'}
                  </button>
                )}
                {request.status === SERVICE_REQUEST_STATUS.IN_PROGRESS && (
                  <button
                    onClick={() => handleUpdateStatus(SERVICE_REQUEST_STATUS.COMPLETED)}
                    disabled={isUpdating}
                    className="w-full px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {isUpdating ? 'Completing...' : 'Mark as Completed'}
                  </button>
                )}
                {(request.status === SERVICE_REQUEST_STATUS.PENDING || request.status === SERVICE_REQUEST_STATUS.CONFIRMED) && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="w-full px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-all"
                  >
                    Cancel Request
                  </button>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Request Details */}
            <Card className="p-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                Request Details
              </h3>
              <div className="space-y-5">
                {/* Status */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-tighter mb-2">
                    Status
                  </label>
                  <div className={`inline-block px-3 py-1.5 rounded-lg text-sm font-medium ${getStatusColor(request.status)}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1).replace('_', ' ')}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-tighter mb-2">
                    Price
                  </label>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <DollarSign className="w-4 h-4 text-primary-500" />
                    {formatCurrency(request.price || 0, request.currency)}
                  </div>
                </div>

                {/* Requested Date */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-tighter mb-2">
                    Requested Date
                  </label>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <Calendar className="w-4 h-4 text-primary-500" />
                    {formatDateTime(request.requestedDate)}
                  </div>
                </div>

                {/* Requested Time */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-tighter mb-2">
                    Requested Time
                  </label>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <Clock className="w-4 h-4 text-primary-500" />
                    {request.requestedTime}
                  </div>
                </div>

                {/* Service Request ID */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-tighter mb-2">
                    Service Request ID
                  </label>
                  <div className="text-sm font-medium text-gray-900 font-mono break-all">
                    {request._id}
                  </div>
                </div>
              </div>
            </Card>

            {/* Client Information */}
            <Card className="p-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                Client Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-gray-900 truncate">
                      {request.customerName}
                    </div>
                  </div>
                </div>
                {request.customerPhone && (
                  <div className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary-50 transition-colors">
                      <Phone className="w-4 h-4 text-gray-400 group-hover:text-primary-500" />
                    </div>
                    <div className="text-sm text-gray-600">
                      {request.customerPhone}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Astrologer Information */}
            <Card className="p-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                Assigned Astrologer
              </h3>
              <div className="space-y-4">
                <Link 
                  to={`${ROUTES.ASTROLOGERS}/${request.astrologerId._id}`}
                  className="flex items-center gap-3 group"
                >
                  <Avatar 
                    src={request.astrologerId.profilePicture}
                    name={request.astrologerId.name} 
                    size="md"
                    className="border border-gray-100"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-gray-900 truncate">
                      {request.astrologerId.name}
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono truncate">
                      {request.astrologerId.email}
                    </div>
                  </div>
                </Link>
                <button
                  onClick={() => navigate(`${ROUTES.ASTROLOGERS}/${request.astrologerId._id}`)}
                  className="w-full px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-all"
                >
                  View Profile
                </button>
              </div>
            </Card>

            {/* Timeline */}
            <Card className="p-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                Timeline
              </h3>
              <div className="space-y-4 text-sm">
                <div className="relative pl-6 pb-4 border-l border-gray-100">
                  <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white shadow-sm" />
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Created</div>
                  <div className="text-gray-900 font-medium">
                    {format(new Date(request.createdAt), 'MMM d, yyyy h:mm a')}
                  </div>
                </div>
                {request.completedAt && (
                  <div className="relative pl-6 last:pb-0">
                    <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white shadow-sm" />
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Completed</div>
                    <div className="text-gray-900 font-medium">
                      {format(new Date(request.completedAt), 'MMM d, yyyy h:mm a')}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} title="Cancel Service Request">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">Are you sure?</p>
                <p className="text-sm text-yellow-700 mt-1">
                  This will cancel the service request. The client and astrologer will be notified.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={isUpdating}
                className="btn btn-secondary"
              >
                Keep Request
              </button>
              <button
                onClick={handleCancel}
                disabled={isUpdating}
                className="btn bg-red-600 text-white hover:bg-red-700"
              >
                {isUpdating ? 'Cancelling...' : 'Cancel Request'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </MainLayout>
  );
};

