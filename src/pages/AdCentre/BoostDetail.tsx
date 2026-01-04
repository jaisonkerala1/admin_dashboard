import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
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
import { formatDateTime, formatTimeBetween } from '@/utils/formatters';
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
            <Zap className="w-16 h-16 text-gray-300 dark:text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-2">Boost Not Found</h3>
            <p className="text-gray-600 dark:text-muted-foreground mb-6">The boost you're looking for doesn't exist.</p>
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
            className="p-2 hover:bg-gray-100 dark:hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-muted-foreground" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-gray-500 dark:text-muted-foreground">
                Boost ID: <span className="font-mono">{boost.boostId}</span>
              </span>
              {getStatusBadge(boost.status)}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground">
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-2">
                    Boost Information
                  </h3>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-muted rounded-xl">
                    <Zap className="w-10 h-10 text-gray-400 dark:text-muted-foreground" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-foreground">
                        Profile Boost
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-muted-foreground">
                        {boost.durationDays} day{boost.durationDays !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Boost Details */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-4">
                Boost Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-muted-foreground mb-1">Status</p>
                  <div className="mt-1">{getStatusBadge(boost.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-muted-foreground mb-1">Duration</p>
                  <p className="font-medium text-gray-900 dark:text-foreground">{boost.durationDays} days</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-muted-foreground mb-1">Daily Cost</p>
                  <p className="font-medium text-gray-900 dark:text-foreground">₹{boost.dailyCost}/day</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-muted-foreground mb-1">Total Cost</p>
                  <p className="font-medium text-gray-900 dark:text-foreground">₹{boost.totalCost.toFixed(0)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-muted-foreground mb-1">Start Date</p>
                  <p className="font-medium text-gray-900 dark:text-foreground">{formatDateTime(boost.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-muted-foreground mb-1">End Date</p>
                  <p className="font-medium text-gray-900 dark:text-foreground">{formatDateTime(boost.endDate)}</p>
                </div>
                {boost.status === 'active' && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 dark:text-muted-foreground mb-2">Time Remaining</p>
                    <CountdownTimer endDate={boost.endDate} className="text-lg" />
                  </div>
                )}
                {boost.status === 'active' && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 dark:text-muted-foreground mb-2">Progress</p>
                    <BoostProgressBar
                      startDate={boost.startDate}
                      endDate={boost.endDate}
                    />
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 dark:text-muted-foreground mb-2">Category</p>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      const category = boost.category || 'general';
                      const categoryLabels: Record<string, string> = {
                        general: '🌟 General',
                        astrology: '🔮 Astrology',
                        tarot: '🃏 Tarot',
                        numerology: '🔢 Numerology',
                        palmistry: '👋 Palmistry',
                        healing: '✨ Healing',
                        meditation: '🧘 Meditation',
                        spiritual: '🙏 Spiritual',
                      };
                      return (
                        <span
                          className="px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium border border-purple-200 dark:border-purple-800"
                        >
                          {categoryLabels[category] || category.charAt(0).toUpperCase() + category.slice(1)}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </Card>

            {/* Timeline */}
            <Card className="p-6">
              <h3 className="text-sm font-bold text-gray-900 dark:text-foreground uppercase tracking-wider mb-6">
                Timeline
              </h3>
              <div className="relative">
                {(() => {
                  // Build timeline events array in chronological order
                  const timelineEvents = [
                    {
                      label: 'Boost Created',
                      description: 'The boost request has been created',
                      timestamp: boost.createdAt,
                      iconColor: 'bg-blue-600',
                      isActive: false,
                    },
                    boost.approvedAt && {
                      label: 'Boost Approved',
                      description: 'The boost has been approved and activated',
                      timestamp: boost.approvedAt,
                      iconColor: 'bg-green-500',
                      isActive: boost.status === 'active',
                    },
                    boost.status === 'active' && !boost.approvedAt && {
                      label: 'Boost Active',
                      description: 'The boost is currently active',
                      timestamp: boost.startDate,
                      iconColor: 'bg-green-500',
                      isActive: true,
                    },
                    boost.rejectedAt && {
                      label: 'Boost Rejected',
                      description: boost.rejectionReason 
                        ? `The boost has been rejected: ${boost.rejectionReason}`
                        : 'The boost has been rejected',
                      timestamp: boost.rejectedAt,
                      iconColor: 'bg-red-500',
                      isActive: boost.status === 'rejected',
                    },
                    boost.cancelledAt && {
                      label: 'Boost Cancelled',
                      description: boost.cancellationReason
                        ? `The boost has been cancelled: ${boost.cancellationReason}`
                        : 'The boost has been cancelled',
                      timestamp: boost.cancelledAt,
                      iconColor: 'bg-red-500',
                      isActive: ['cancelled', 'cancelled_by_user', 'cancelled_by_admin'].includes(boost.status),
                    },
                    boost.status === 'expired' && {
                      label: 'Boost Expired',
                      description: 'The boost has expired',
                      timestamp: boost.endDate,
                      iconColor: 'bg-gray-500',
                      isActive: true,
                    },
                  ].filter(Boolean) as Array<{
                    label: string;
                    description: string;
                    timestamp: string;
                    iconColor: string;
                    isActive: boolean;
                  }>;

                  // Sort events by timestamp to ensure chronological order
                  timelineEvents.sort((a, b) => 
                    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                  );

                  return timelineEvents.map((event, index) => {
                    const isLast = index === timelineEvents.length - 1;
                    const hasNext = !isLast;
                    const previousEvent = index > 0 ? timelineEvents[index - 1] : null;
                    const timeSincePrevious = previousEvent 
                      ? formatTimeBetween(previousEvent.timestamp, event.timestamp)
                      : null;
                    
                    return (
                      <div key={event.label} className="relative">
                        {/* Vertical line connecting events */}
                        {hasNext && (
                          <div className="absolute left-[11px] top-[24px] w-0.5 h-full bg-gray-200 dark:bg-border" />
                        )}
                        
                        {/* Event content */}
                        <div className={`relative flex items-start gap-4 pb-6 ${isLast ? 'pb-0' : ''}`}>
                          {/* Icon */}
                          <div className="relative z-10 flex-shrink-0">
                            <div className={`w-6 h-6 rounded-full ${event.iconColor} flex items-center justify-center shadow-md`}>
                              <div className="w-2.5 h-2.5 rounded-full bg-white dark:bg-card" />
                            </div>
                          </div>
                          
                          {/* Content */}
                          <div className={`flex-1 pt-0.5 ${event.isActive ? 'pb-4' : ''}`}>
                            {/* Active event highlight background */}
                            {event.isActive && (
                              <div className={`absolute left-0 right-0 -mx-6 -my-2 px-6 py-3 rounded-lg ${
                                event.iconColor === 'bg-green-500' 
                                  ? 'bg-green-50/50 dark:bg-green-900/20 border border-green-100/50 dark:border-green-800' 
                                  : event.iconColor === 'bg-red-500'
                                  ? 'bg-red-50/50 dark:bg-red-900/20 border border-red-100/50 dark:border-red-800'
                                  : 'bg-gray-50/50 dark:bg-muted border border-gray-100/50 dark:border-border'
                              }`} />
                            )}
                            
                            <div className="relative">
                              <p className={`font-semibold mb-1 ${
                                event.isActive 
                                  ? event.iconColor === 'bg-green-500' 
                                    ? 'text-green-700 dark:text-green-400' 
                                    : event.iconColor === 'bg-red-500'
                                    ? 'text-red-700 dark:text-red-400'
                                    : 'text-gray-700 dark:text-foreground'
                                  : 'text-gray-900 dark:text-foreground'
                              }`}>
                                {event.description}
                              </p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm text-gray-500 dark:text-muted-foreground font-medium">
                                  {format(new Date(event.timestamp), 'd MMM HH:mm')}
                                </p>
                                {timeSincePrevious && (
                                  <>
                                    <span className="text-gray-300 dark:text-muted-foreground/50">•</span>
                                    <p className="text-xs text-gray-400 dark:text-muted-foreground font-medium">
                                      {timeSincePrevious} later
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </Card>

            {/* Admin Actions */}
            {(boost.status === 'pending' || boost.status === 'active') && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-4">
                  Actions
                </h3>
                <div className="space-y-2">
                  {boost.status === 'pending' && (
                    <>
                      <button
                        onClick={handleApprove}
                        disabled={isProcessing}
                        className="w-full px-5 py-2.5 bg-gray-900 dark:bg-primary-600 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all shadow-sm flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {isProcessing ? 'Approving...' : 'Approve Boost'}
                      </button>
                      <button
                        onClick={handleReject}
                        className="w-full px-5 py-2.5 bg-white dark:bg-card border border-gray-200 dark:border-border text-gray-700 dark:text-foreground rounded-lg hover:bg-gray-50 dark:hover:bg-muted text-sm font-medium transition-all"
                      >
                        Reject Boost
                      </button>
                    </>
                  )}
                  {boost.status === 'active' && (
                    <button
                      onClick={handleCancel}
                      className="w-full px-5 py-2.5 bg-white dark:bg-card border border-gray-200 dark:border-border text-gray-700 dark:text-foreground rounded-lg hover:bg-gray-50 dark:hover:bg-muted text-sm font-medium transition-all"
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
              <h3 className="text-sm font-bold text-gray-900 dark:text-foreground uppercase tracking-wider mb-4">
                Boost Details
              </h3>
              <div className="space-y-5">
                {/* Status */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 dark:text-muted-foreground uppercase tracking-tighter mb-2">
                    Status
                  </label>
                  <div>{getStatusBadge(boost.status)}</div>
                </div>

                {/* Total Cost */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 dark:text-muted-foreground uppercase tracking-tighter mb-2">
                    Total Cost
                  </label>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-foreground">
                    <DollarSign className="w-4 h-4 text-gray-500 dark:text-muted-foreground" />
                    ₹{boost.totalCost.toFixed(0)}
                  </div>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 dark:text-muted-foreground uppercase tracking-tighter mb-2">
                    Start Date
                  </label>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-foreground">
                    <Calendar className="w-4 h-4 text-gray-500 dark:text-muted-foreground" />
                    {formatDateTime(boost.startDate)}
                  </div>
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 dark:text-muted-foreground uppercase tracking-tighter mb-2">
                    End Date
                  </label>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-foreground">
                    <Clock className="w-4 h-4 text-gray-500 dark:text-muted-foreground" />
                    {formatDateTime(boost.endDate)}
                  </div>
                </div>

                {/* Boost ID */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 dark:text-muted-foreground uppercase tracking-tighter mb-2">
                    Boost ID
                  </label>
                  <div className="text-sm font-medium text-gray-900 dark:text-foreground font-mono break-all">
                    {boost.boostId}
                  </div>
                </div>

                {/* Created At */}
                {boost.createdAt && (
                  <div>
                    <label className="block text-xs font-medium text-gray-400 dark:text-muted-foreground uppercase tracking-tighter mb-2">
                      Created At
                    </label>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-foreground">
                      <Clock className="w-4 h-4 text-gray-500 dark:text-muted-foreground" />
                      {formatDateTime(boost.createdAt)}
                    </div>
                  </div>
                )}

                {/* Approved At */}
                {boost.approvedAt && (
                  <div>
                    <label className="block text-xs font-medium text-gray-400 dark:text-muted-foreground uppercase tracking-tighter mb-2">
                      Approved At
                    </label>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-foreground">
                      <CheckCircle className="w-4 h-4 text-gray-500 dark:text-muted-foreground" />
                      {formatDateTime(boost.approvedAt)}
                    </div>
                  </div>
                )}

                {/* Rejected At */}
                {boost.rejectedAt && (
                  <div>
                    <label className="block text-xs font-medium text-gray-400 dark:text-muted-foreground uppercase tracking-tighter mb-2">
                      Rejected At
                    </label>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-foreground">
                      <XCircle className="w-4 h-4 text-gray-500 dark:text-muted-foreground" />
                      {formatDateTime(boost.rejectedAt)}
                    </div>
                    {boost.rejectionReason && (
                      <p className="text-xs text-gray-600 dark:text-muted-foreground mt-1">{boost.rejectionReason}</p>
                    )}
                  </div>
                )}

                {/* Cancelled At */}
                {boost.cancelledAt && (
                  <div>
                    <label className="block text-xs font-medium text-gray-400 dark:text-muted-foreground uppercase tracking-tighter mb-2">
                      Cancelled At
                    </label>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-foreground">
                      <XCircle className="w-4 h-4 text-gray-500 dark:text-muted-foreground" />
                      {formatDateTime(boost.cancelledAt)}
                    </div>
                    {boost.cancellationReason && (
                      <p className="text-xs text-gray-600 dark:text-muted-foreground mt-1">{boost.cancellationReason}</p>
                    )}
                  </div>
                )}

                {/* Created By Admin */}
                {boost.createdByAdmin && (
                  <div>
                    <label className="block text-xs font-medium text-gray-400 dark:text-muted-foreground uppercase tracking-tighter mb-2">
                      Created By
                    </label>
                    <div className="text-sm font-medium text-gray-900 dark:text-foreground">
                      Admin
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Astrologer Information */}
            {astrologer && (
              <Card className="p-6">
                <h3 className="text-sm font-bold text-gray-900 dark:text-foreground uppercase tracking-wider mb-4">
                  Astrologer Information
                </h3>
                <div className="space-y-4">
                  <Link 
                    to={`${ROUTES.ASTROLOGERS}/${astrologer.id}`}
                    className="flex items-center gap-3 group hover:opacity-80 transition-opacity"
                  >
                    {astrologer.profilePicture ? (
                      <Avatar src={astrologer.profilePicture} alt={astrologer.name} size="md" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-muted flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-400 dark:text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-foreground group-hover:text-gray-700 dark:group-hover:text-foreground">{astrologer.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-muted-foreground">{astrologer.email}</p>
                    </div>
                  </Link>
                  <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-border">
                    {astrologer.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-foreground">
                        <Phone className="w-4 h-4 text-gray-400 dark:text-muted-foreground" />
                        {astrologer.phone}
                      </div>
                    )}
                    {astrologer.experience && (
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-foreground">
                        <TrendingUp className="w-4 h-4 text-gray-400 dark:text-muted-foreground" />
                        {astrologer.experience} years experience
                      </div>
                    )}
                    {astrologer.ratePerMinute && (
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-foreground">
                        <DollarSign className="w-4 h-4 text-gray-400 dark:text-muted-foreground" />
                        ₹{astrologer.ratePerMinute}/min
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => navigate(`${ROUTES.ASTROLOGERS}/${astrologer.id}`)}
                    className="w-full mt-4 px-4 py-2 bg-white dark:bg-card border border-gray-200 dark:border-border text-gray-700 dark:text-foreground rounded-lg hover:bg-gray-50 dark:hover:bg-muted text-sm font-medium transition-all"
                  >
                    View Profile
                  </button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card rounded-lg shadow-xl max-w-md w-full p-6 border dark:border-border">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-4">Reject Boost</h3>
            <p className="text-sm text-gray-600 dark:text-muted-foreground mb-4">
              Please provide a reason for rejecting this boost request (optional):
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-border rounded-lg bg-white dark:bg-background text-gray-900 dark:text-foreground placeholder:text-gray-400 dark:placeholder:text-muted-foreground focus:ring-2 focus:ring-gray-500 dark:focus:ring-primary-500 focus:border-transparent mb-4"
              rows={4}
            />
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-border rounded-lg text-gray-700 dark:text-foreground hover:bg-gray-50 dark:hover:bg-muted transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-gray-900 dark:bg-primary-600 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card rounded-lg shadow-xl max-w-md w-full p-6 border dark:border-border">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-4">Cancel Boost</h3>
            <p className="text-sm text-gray-600 dark:text-muted-foreground mb-4">
              Please provide a reason for cancelling this boost:
            </p>
            <textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Enter cancellation reason..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-border rounded-lg bg-white dark:bg-background text-gray-900 dark:text-foreground placeholder:text-gray-400 dark:placeholder:text-muted-foreground focus:ring-2 focus:ring-gray-500 dark:focus:ring-primary-500 focus:border-transparent mb-4"
              rows={4}
              required
            />
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancellationReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-border rounded-lg text-gray-700 dark:text-foreground hover:bg-gray-50 dark:hover:bg-muted transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmCancel}
                disabled={isProcessing || !cancellationReason.trim()}
                className="flex-1 px-4 py-2 bg-gray-900 dark:bg-primary-600 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
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

