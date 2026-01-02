import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Zap,
  Calendar,
  Clock,
  DollarSign,
  User,
  Phone,
  CheckCircle,
  XCircle,
  TrendingUp
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Card, Avatar, SkeletonBox } from '@/components/common';
import { adCentreApi } from '@/api/adCentre';
import { CountdownTimer, BoostProgressBar } from '@/components/common';
import { formatDateTime } from '@/utils/formatters';
import { useToastContext } from '@/contexts/ToastContext';
import { ROUTES } from '@/utils/constants';
import { useAppDispatch } from '@/store/hooks';
import { approveBoostRequest, rejectBoostRequest, cancelBoostRequest, fetchBoostsRequest, fetchStatisticsRequest } from '@/store/slices/adCentreSlice';
import type { BoostDetails } from '@/store/slices/adCentreSlice';

export const BoostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const toast = useToastContext();
  const [boostDetails, setBoostDetails] = useState<BoostDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');

  useEffect(() => {
    if (id) {
      loadBoostDetails();
    }
  }, [id]);

  const loadBoostDetails = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const response = await adCentreApi.getBoostDetails(id);
      if (response.success && response.data) {
        setBoostDetails({
          ...response.data.boost,
          astrologer: response.data.astrologer,
        });
      }
    } catch (err) {
      console.error('Failed to load boost details:', err);
      toast.error('Failed to load boost details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!id) return;
    try {
      setIsProcessing(true);
      dispatch(approveBoostRequest(id));
      setTimeout(() => {
        loadBoostDetails();
        dispatch(fetchBoostsRequest({}));
        dispatch(fetchStatisticsRequest());
        toast.success('Boost approved successfully');
      }, 1000);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to approve boost');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = () => {
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!id) return;
    try {
      setIsProcessing(true);
      dispatch(rejectBoostRequest({ boostId: id, reason: rejectionReason }));
      setTimeout(() => {
        setShowRejectModal(false);
        setRejectionReason('');
        loadBoostDetails();
        dispatch(fetchBoostsRequest({}));
        dispatch(fetchStatisticsRequest());
        toast.success('Boost rejected successfully');
      }, 1000);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to reject boost');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (!id || !cancellationReason.trim()) {
      toast.error('Cancellation reason is required');
      return;
    }
    try {
      setIsProcessing(true);
      dispatch(cancelBoostRequest({ boostId: id, reason: cancellationReason }));
      setTimeout(() => {
        setShowCancelModal(false);
        setCancellationReason('');
        loadBoostDetails();
        dispatch(fetchBoostsRequest({}));
        dispatch(fetchStatisticsRequest());
        toast.success('Boost cancelled successfully');
      }, 1000);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to cancel boost');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      active: 'bg-gray-900 text-white',
      pending: 'bg-gray-200 text-gray-700',
      expired: 'bg-gray-100 text-gray-600',
      rejected: 'bg-gray-200 text-gray-700',
      cancelled_by_user: 'bg-gray-100 text-gray-600',
      cancelled_by_admin: 'bg-gray-200 text-gray-700',
    };
    const statusLabels: Record<string, string> = {
      active: 'Active',
      pending: 'Pending',
      expired: 'Expired',
      rejected: 'Rejected',
      cancelled_by_user: 'Cancelled by User',
      cancelled_by_admin: 'Cancelled by Admin',
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          statusStyles[status] || 'bg-gray-100 text-gray-600'
        }`}
      >
        {statusLabels[status] || status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <SkeletonBox width={40} height={40} radius={8} />
            <div className="flex-1">
              <SkeletonBox width={200} height={24} radius={6} className="mb-2" />
              <SkeletonBox width={300} height={20} radius={4} />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <Card className="p-6">
                <SkeletonBox width={180} height={20} radius={6} className="mb-4" />
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="space-y-2">
                      <SkeletonBox width={80} height={14} radius={4} />
                      <SkeletonBox width={120} height={16} radius={4} />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            <div className="space-y-4">
              <Card className="p-6">
                <SkeletonBox width={150} height={16} radius={4} className="mb-4" />
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-2">
                      <SkeletonBox width={80} height={12} radius={4} />
                      <SkeletonBox width={120} height={16} radius={4} />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!boostDetails) {
    return (
      <MainLayout>
        <Card>
          <div className="text-center py-12">
            <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Boost Not Found</h3>
            <p className="text-gray-600 mb-6">The boost you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate(ROUTES.AD_CENTRE)}
              className="btn btn-primary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Ad Centre
            </button>
          </div>
        </Card>
      </MainLayout>
    );
  }

  const boost = boostDetails;
  const astrologer = boostDetails.astrologer;

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(ROUTES.AD_CENTRE)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-gray-500">
                Boost ID: <span className="font-mono">{boost.boostId}</span>
              </span>
              {getStatusBadge(boost.status)}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Profile Boost - {astrologer?.name || 'Unknown Astrologer'}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Boost Information */}
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Boost Information
                  </h3>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <Zap className="w-10 h-10 text-gray-400" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        Profile Boost
                      </h4>
                      <p className="text-sm text-gray-600">
                        {boost.durationDays} day{boost.durationDays !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Boost Details */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Boost Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <div className="mt-1">{getStatusBadge(boost.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Duration</p>
                  <p className="font-medium text-gray-900">{boost.durationDays} days</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Daily Cost</p>
                  <p className="font-medium text-gray-900">₹{boost.dailyCost}/day</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Cost</p>
                  <p className="font-medium text-gray-900">₹{boost.totalCost.toFixed(0)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Start Date</p>
                  <p className="font-medium text-gray-900">{formatDateTime(boost.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">End Date</p>
                  <p className="font-medium text-gray-900">{formatDateTime(boost.endDate)}</p>
                </div>
                {boost.status === 'active' && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 mb-2">Time Remaining</p>
                    <CountdownTimer endDate={boost.endDate} className="text-lg" />
                  </div>
                )}
                {boost.status === 'active' && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 mb-2">Progress</p>
                    <BoostProgressBar
                      startDate={boost.startDate}
                      endDate={boost.endDate}
                    />
                  </div>
                )}
              </div>
            </Card>

            {/* Admin Actions */}
            {(boost.status === 'pending' || boost.status === 'active') && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Actions
                </h3>
                <div className="space-y-2">
                  {boost.status === 'pending' && (
                    <>
                      <button
                        onClick={handleApprove}
                        disabled={isProcessing}
                        className="w-full px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all shadow-sm flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {isProcessing ? 'Approving...' : 'Approve Boost'}
                      </button>
                      <button
                        onClick={handleReject}
                        className="w-full px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-all"
                      >
                        Reject Boost
                      </button>
                    </>
                  )}
                  {boost.status === 'active' && (
                    <button
                      onClick={handleCancel}
                      className="w-full px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-all"
                    >
                      Cancel Boost
                    </button>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Boost Details */}
            <Card className="p-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                Boost Details
              </h3>
              <div className="space-y-5">
                {/* Status */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-tighter mb-2">
                    Status
                  </label>
                  <div>{getStatusBadge(boost.status)}</div>
                </div>

                {/* Total Cost */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-tighter mb-2">
                    Total Cost
                  </label>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    ₹{boost.totalCost.toFixed(0)}
                  </div>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-tighter mb-2">
                    Start Date
                  </label>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    {formatDateTime(boost.startDate)}
                  </div>
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-tighter mb-2">
                    End Date
                  </label>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <Clock className="w-4 h-4 text-gray-500" />
                    {formatDateTime(boost.endDate)}
                  </div>
                </div>

                {/* Boost ID */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-tighter mb-2">
                    Boost ID
                  </label>
                  <div className="text-sm font-medium text-gray-900 font-mono break-all">
                    {boost.boostId}
                  </div>
                </div>

                {/* Created At */}
                {boost.createdAt && (
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-tighter mb-2">
                      Created At
                    </label>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                      <Clock className="w-4 h-4 text-gray-500" />
                      {formatDateTime(boost.createdAt)}
                    </div>
                  </div>
                )}

                {/* Approved At */}
                {boost.approvedAt && (
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-tighter mb-2">
                      Approved At
                    </label>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                      <CheckCircle className="w-4 h-4 text-gray-500" />
                      {formatDateTime(boost.approvedAt)}
                    </div>
                  </div>
                )}

                {/* Rejected At */}
                {boost.rejectedAt && (
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-tighter mb-2">
                      Rejected At
                    </label>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                      <XCircle className="w-4 h-4 text-gray-500" />
                      {formatDateTime(boost.rejectedAt)}
                    </div>
                    {boost.rejectionReason && (
                      <p className="text-xs text-gray-600 mt-1">{boost.rejectionReason}</p>
                    )}
                  </div>
                )}

                {/* Cancelled At */}
                {boost.cancelledAt && (
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-tighter mb-2">
                      Cancelled At
                    </label>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                      <XCircle className="w-4 h-4 text-gray-500" />
                      {formatDateTime(boost.cancelledAt)}
                    </div>
                    {boost.cancellationReason && (
                      <p className="text-xs text-gray-600 mt-1">{boost.cancellationReason}</p>
                    )}
                  </div>
                )}

                {/* Created By Admin */}
                {boost.createdByAdmin && (
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-tighter mb-2">
                      Created By
                    </label>
                    <div className="text-sm font-medium text-gray-900">
                      Admin
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Astrologer Information */}
            {astrologer && (
              <Card className="p-6">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                  Astrologer Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {astrologer.profilePicture ? (
                      <Avatar src={astrologer.profilePicture} alt={astrologer.name} size="md" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{astrologer.name}</h4>
                      <p className="text-sm text-gray-600">{astrologer.email}</p>
                    </div>
                  </div>
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    {astrologer.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {astrologer.phone}
                      </div>
                    )}
                    {astrologer.experience && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                        {astrologer.experience} years experience
                      </div>
                    )}
                    {astrologer.ratePerMinute && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        ₹{astrologer.ratePerMinute}/min
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Boost</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejecting this boost request (optional):
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent mb-4"
              rows={4}
            />
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Boost</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for cancelling this boost:
            </p>
            <textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Enter cancellation reason..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent mb-4"
              rows={4}
              required
            />
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancellationReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmCancel}
                disabled={isProcessing || !cancellationReason.trim()}
                className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isProcessing ? 'Cancelling...' : 'Cancel Boost'}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

