import React, { useEffect, useState } from 'react';
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
import { Loader } from '@/components/common';
import { Bell, CheckCircle, UserPlus, Package, Edit } from 'lucide-react';
import type { ApprovalRequestType } from '@/types/approval';

const tabs: { id: ApprovalRequestType | 'all'; name: string; icon: typeof CheckCircle }[] = [
  { id: 'all', name: 'All', icon: CheckCircle },
  { id: 'onboarding', name: 'Onboarding', icon: UserPlus },
  { id: 'verification_badge', name: 'Verification', icon: CheckCircle },
  { id: 'service_approval', name: 'Services', icon: Package },
  { id: 'profile_update', name: 'Profile Updates', icon: Edit },
];

export const Approvals = () => {
  const dispatch = useAppDispatch();
  const {
    requests,
    stats,
    filters,
    pagination,
    isLoading,
    isLoadingStats,
    currentRequest,
    isLoadingDetail,
    isProcessing,
    error,
  } = useAppSelector((state) => state.approval);

  const [activeTab, setActiveTab] = useState<ApprovalRequestType | 'all'>('all');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch stats on mount
  useEffect(() => {
    dispatch(fetchStatsRequest());
  }, [dispatch]);

  // Fetch requests when filters or tab changes
  useEffect(() => {
    const typeFilter = activeTab === 'all' ? undefined : activeTab;
    dispatch(
      fetchRequestsRequest({
        filters: { ...filters, type: typeFilter || filters.type },
        page: pagination.page,
        limit: pagination.limit,
      })
    );
  }, [dispatch, activeTab, filters.status, filters.search, pagination.page]);

  // Update filters when tab changes
  useEffect(() => {
    if (activeTab !== 'all') {
      dispatch(setFilters({ type: activeTab }));
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

      {/* Requests List */}
      {isLoading ? (
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

