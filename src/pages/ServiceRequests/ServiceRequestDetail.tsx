import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft,
  ClipboardList,
  Calendar,
  Package,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { PageHeader } from '@/components/layout/PageHeader';
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
      setRequest(response.data);
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
      case SERVICE_REQUEST_STATUS.APPROVED: return 'bg-green-100 text-green-700';
      case SERVICE_REQUEST_STATUS.REJECTED: return 'bg-red-100 text-red-700';
      case SERVICE_REQUEST_STATUS.COMPLETED: return 'bg-blue-100 text-blue-700';
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
      <PageHeader
        title="Service Request Details"
        subtitle={`Request ID: ${request._id}`}
        action={
          <button
            onClick={() => navigate(ROUTES.SERVICE_REQUESTS)}
            className="btn btn-secondary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Service Requests
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Card */}
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="p-6 bg-primary-50 rounded-full">
              <ClipboardList className="w-16 h-16 text-primary-600" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900">Service Request</h2>
            <div className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </div>
            
            <div className="w-full mt-6 space-y-3 border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Price</span>
                <span className="font-semibold text-gray-900">{formatCurrency(request.price || 0, request.currency)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Date</span>
                <span className="font-semibold text-gray-900">{formatDateTime(request.requestedDate)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Time</span>
                <span className="font-semibold text-gray-900">{request.requestedTime}</span>
              </div>
              {request.completedAt && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-semibold text-gray-900">{formatDateTime(request.completedAt)}</span>
                </div>
              )}
            </div>

            {/* Admin Actions */}
            <div className="w-full mt-6 space-y-2">
              {request.status === SERVICE_REQUEST_STATUS.PENDING && (
                <>
                  <button
                    onClick={() => handleUpdateStatus(SERVICE_REQUEST_STATUS.APPROVED)}
                    disabled={isUpdating}
                    className="w-full btn btn-primary"
                  >
                    {isUpdating ? 'Approving...' : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Request
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(SERVICE_REQUEST_STATUS.REJECTED)}
                    disabled={isUpdating}
                    className="w-full btn bg-red-50 text-red-700 hover:bg-red-100"
                  >
                    {isUpdating ? 'Rejecting...' : (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject Request
                      </>
                    )}
                  </button>
                </>
              )}
              {request.status === SERVICE_REQUEST_STATUS.APPROVED && (
                <button
                  onClick={() => handleUpdateStatus(SERVICE_REQUEST_STATUS.COMPLETED)}
                  disabled={isUpdating}
                  className="w-full btn btn-primary"
                >
                  {isUpdating ? 'Completing...' : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Completed
                    </>
                  )}
                </button>
              )}
              {(request.status === SERVICE_REQUEST_STATUS.PENDING || request.status === SERVICE_REQUEST_STATUS.APPROVED) && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full btn btn-secondary"
                >
                  Cancel Request
                </button>
              )}
            </div>
          </div>
        </Card>

        {/* Details Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Client Information</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4">
                <Avatar 
                  name={request.customerName} 
                  size="lg" 
                />
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {request.customerName}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {request.customerPhone}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Astrologer Info */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Assigned Astrologer</h3>
            <div className="flex items-center gap-4">
              <Link 
                to={`${ROUTES.ASTROLOGERS}/${request.astrologerId._id}`}
                className="flex items-center gap-4 hover:opacity-80 transition-opacity"
              >
                <Avatar 
                  src={request.astrologerId.profilePicture}
                  name={request.astrologerId.name} 
                  size="lg" 
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    {request.astrologerId.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {request.astrologerId.email}
                  </p>
                </div>
              </Link>
              <button
                onClick={() => navigate(`${ROUTES.ASTROLOGERS}/${request.astrologerId._id}`)}
                className="btn btn-secondary"
              >
                View Profile
              </button>
            </div>
          </Card>

          {/* Service Info */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Service Details</h3>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Package className="w-10 h-10 text-primary-600" />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">
                  {request.serviceName}
                </h4>
                <p className="text-sm text-gray-600">
                  {request.serviceCategory}
                </p>
              </div>
              {request.serviceId && (
                <Link to={`${ROUTES.SERVICES}/${request.serviceId}`} className="text-sm text-primary-600 font-medium hover:text-primary-700">
                  View Service →
                </Link>
              )}
            </div>
          </Card>

          {/* Details */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Request Details</h3>
            {request.specialInstructions ? (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Special Instructions:</p>
                <p className="text-gray-700 whitespace-pre-wrap">{request.specialInstructions}</p>
              </div>
            ) : (
              <p className="text-gray-500 italic">No special instructions provided.</p>
            )}
            {request.notes && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Admin Notes:</p>
                <p className="text-gray-700 whitespace-pre-wrap">{request.notes}</p>
              </div>
            )}
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="!p-4 border-l-4 border-l-blue-500">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-600">Created</p>
                  <p className="text-sm font-semibold text-gray-900">{formatDateTime(request.createdAt)}</p>
                </div>
              </div>
            </Card>
            
            <Card className="!p-4 border-l-4 border-l-purple-500">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-xs text-gray-600">Price</p>
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(request.price || 0, request.currency)}</p>
                </div>
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

