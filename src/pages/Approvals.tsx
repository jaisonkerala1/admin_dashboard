import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchRequestsRequest,
  fetchStatsRequest,
  fetchRequestDetailRequest,
  approveRequestRequest,
  rejectRequestRequest,
  setFilters,
  clearCurrentRequest,
} from '@/store/slices/approvalSlice';
import {
  ApprovalRequestCard,
  ApprovalStatsCards,
  ApprovalFilterBar,
  ApprovalRequestDetailModal,
} from '@/components/approvals';
import { Loader, Card } from '@/components/common';
import { Bell, CheckCircle, UserPlus, Package, Edit, Zap } from 'lucide-react';
import type { ApprovalRequestType } from '@/types/approval';
import { fetchBoostsRequest, approveBoostRequest, rejectBoostRequest } from '@/store/slices/adCentreSlice';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';
import { getImageUrl } from '@/utils/helpers';
import { formatDateTime } from '@/utils/formatters';

const tabs: { id: ApprovalRequestType | 'all' | 'ads'; name: string; icon: typeof CheckCircle }[] = [
  { id: 'all', name: 'All', icon: CheckCircle },
  { id: 'onboarding', name: 'Onboarding', icon: UserPlus },
  { id: 'verification_badge', name: 'Verification', icon: CheckCircle },
  { id: 'service_approval', name: 'Services', icon: Package },
  { id: 'profile_update', name: 'Profile Updates', icon: Edit },
  { id: 'ads', name: 'Ads', icon: Zap },
];

export const Approvals = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    requests,
    stats,
    filters,
    pagination,
    isLoading,
    isLoadingStats,
    currentRequest,
    isProcessing,
    error,
  } = useAppSelector((state) => state.approval);

  // Ad Centre state for pending boosts
  const {
    boosts: pendingBoosts,
    isLoading: isLoadingBoosts,
    isProcessing: isProcessingBoost,
  } = useAppSelector((state) => state.adCentre);

  const [activeTab, setActiveTab] = useState<ApprovalRequestType | 'all' | 'ads'>('all');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch stats on mount
  useEffect(() => {
    dispatch(fetchStatsRequest());
  }, [dispatch]);

  // Fetch requests when filters or tab changes (only if not ads tab)
  useEffect(() => {
    if (activeTab === 'ads') {
      // Fetch pending boosts when ads tab is active
      dispatch(
        fetchBoostsRequest({
          filters: { status: 'pending', search: '' },
          page: 1,
          limit: 50,
          sort: 'createdAt',
        })
      );
    } else {
      const typeFilter = activeTab === 'all' ? undefined : activeTab;
      dispatch(
        fetchRequestsRequest({
          filters: { ...filters, type: typeFilter || filters.type },
          page: pagination.page,
          limit: pagination.limit,
        })
      );
    }
  }, [dispatch, activeTab, filters.status, filters.search, pagination.page]);

  // Update filters when tab changes (only for approval tabs, not ads)
  useEffect(() => {
    if (activeTab === 'ads') {
      // Skip filter update for ads tab
      return;
    }
    if (activeTab !== 'all') {
      dispatch(setFilters({ type: activeTab as ApprovalRequestType }));
    } else {
      dispatch(setFilters({ type: 'all' }));
    }
  }, [activeTab, dispatch]);

  // Fetch request detail when selected
  useEffect(() => {
    if (selectedRequestId) {
      dispatch(fetchRequestDetailRequest(selectedRequestId));
      setIsModalOpen(true);
    }
  }, [selectedRequestId, dispatch]);

  const handleRequestClick = (requestId: string) => {
    setSelectedRequestId(requestId);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequestId(null);
    dispatch(clearCurrentRequest());
  };

  const handleApprove = (requestId: string, notes?: string) => {
    dispatch(approveRequestRequest({ requestId, notes }));
    // Close modal after a delay to show success
    setTimeout(() => {
      handleCloseModal();
      // Refresh requests
      dispatch(fetchRequestsRequest({ filters, page: pagination.page, limit: pagination.limit }));
    }, 1000);
  };

  const handleReject = (requestId: string, rejectionReason: string) => {
    dispatch(rejectRequestRequest({ requestId, rejectionReason }));
    // Close modal after a delay to show success
    setTimeout(() => {
      handleCloseModal();
      // Refresh requests
      dispatch(fetchRequestsRequest({ filters, page: pagination.page, limit: pagination.limit }));
    }, 1000);
  };

  // Handle boost approval/rejection
  const handleBoostClick = (boostId: string) => {
    navigate(`${ROUTES.AD_CENTRE}/${boostId}`);
  };

  const handleBoostApprove = async (boostId: string) => {
    try {
      dispatch(approveBoostRequest(boostId));
      // Refresh pending boosts after a delay
      setTimeout(() => {
        dispatch(
          fetchBoostsRequest({
            filters: { status: 'pending', search: '' },
            page: 1,
            limit: 50,
            sort: 'createdAt',
          })
        );
      }, 1000);
    } catch (err) {
      console.error('Failed to approve boost:', err);
    }
  };

  const handleBoostReject = async (boostId: string, reason: string) => {
    try {
      dispatch(rejectBoostRequest({ boostId, reason }));
      // Refresh pending boosts after a delay
      setTimeout(() => {
        dispatch(
          fetchBoostsRequest({
            filters: { status: 'pending', search: '' },
            page: 1,
            limit: 50,
            sort: 'createdAt',
          })
        );
      }, 1000);
    } catch (err) {
      console.error('Failed to reject boost:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      pending: 'bg-orange-100 text-orange-700',
      active: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          statusStyles[status] || 'bg-gray-100 text-gray-600'
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const pendingCount = stats?.totalPending || 0;

  return (
    <MainLayout>
      <PageHeader
        title="Approval Requests"
        subtitle="Review and manage astrologer approval requests"
        action={
          pendingCount > 0 ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg">
              <Bell className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">
                {pendingCount} Pending
              </span>
            </div>
          ) : null
        }
      />

      {/* Stats Cards */}
      <div className="mb-6">
        <ApprovalStatsCards stats={stats} isLoading={isLoadingStats} />
      </div>

      {/* Filter Bar */}
      <ApprovalFilterBar filters={filters} onFiltersChange={(f) => dispatch(setFilters(f))} />

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-1 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                  isActive
                    ? 'border-blue-500 text-blue-600 font-semibold'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Requests List or Boosts List */}
      {activeTab === 'ads' ? (
        // Pending Boosts Display
        isLoadingBoosts ? (
          <div className="flex items-center justify-center py-12">
            <Loader />
          </div>
        ) : pendingBoosts.length === 0 ? (
          <div className="text-center py-12">
            <Zap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No pending boost requests found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingBoosts.map((boost) => (
              <div
                key={boost.boostId}
                onClick={() => handleBoostClick(boost.boostId)}
                className="cursor-pointer"
              >
                <Card className="hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {boost.astrologerAvatar ? (
                        <img
                          src={getImageUrl(boost.astrologerAvatar) || ''}
                          alt={boost.astrologerName}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
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
                        className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 ${boost.astrologerAvatar ? 'hidden' : ''}`}
                      >
                        <span className="text-gray-600 font-semibold text-sm">
                          {boost.astrologerName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{boost.astrologerName}</h3>
                        <p className="text-xs text-gray-500">{boost.astrologerPhone}</p>
                      </div>
                    </div>
                    {getStatusBadge(boost.status)}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Duration:</span>
                      <span className="font-medium text-gray-900">{boost.durationDays} days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Cost:</span>
                      <span className="font-medium text-gray-900">₹{boost.totalCost.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Start:</span>
                      <span className="font-medium text-gray-700">{formatDateTime(boost.startDate)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">End:</span>
                      <span className="font-medium text-gray-700">{formatDateTime(boost.endDate)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBoostApprove(boost.boostId);
                      }}
                      disabled={isProcessingBoost}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const reason = prompt('Enter rejection reason (optional):');
                        if (reason !== null) {
                          handleBoostReject(boost.boostId, reason);
                        }
                      }}
                      disabled={isProcessingBoost}
                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )
      ) : (
        // Regular Approval Requests Display
        isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No approval requests found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <ApprovalRequestCard
                key={request._id}
                request={request}
                onClick={() => handleRequestClick(request._id)}
              />
            ))}

            {/* Pagination */}
            {pagination.total > pagination.limit && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => {
                    if (pagination.page > 1) {
                      dispatch({ type: 'approval/setPage', payload: pagination.page - 1 });
                    }
                  }}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
                </span>
                <button
                  onClick={() => {
                    if (pagination.page < Math.ceil(pagination.total / pagination.limit)) {
                      dispatch({ type: 'approval/setPage', payload: pagination.page + 1 });
                    }
                  }}
                  disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )
      )}

      {/* Detail Modal */}
      <ApprovalRequestDetailModal
        request={currentRequest}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onApprove={handleApprove}
        onReject={handleReject}
        isProcessing={isProcessing}
      />
    </MainLayout>
  );
};

