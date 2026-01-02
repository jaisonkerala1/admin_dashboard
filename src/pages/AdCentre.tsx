import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchBoostsRequest,
  fetchBoostDetailsRequest,
  approveBoostRequest,
  rejectBoostRequest,
  createBoostRequest,
  cancelBoostRequest,
  triggerExpiryRequest,
  fetchStatisticsRequest,
  setFilters,
  setPage,
  clearCurrentBoost,
} from '@/store/slices/adCentreSlice';
import { Loader, CountdownTimer, BoostProgressBar } from '@/components/common';
import { CreateBoostModal } from '@/components/adCentre/CreateBoostModal';
import { useToastContext } from '@/hooks/useToast';
import { TrendingUp, CheckCircle, XCircle, Clock, Search, Plus, RefreshCw } from 'lucide-react';
import type { Boost, BoostFilters } from '@/store/slices/adCentreSlice';

const statusOptions: Array<{ value: BoostFilters['status']; label: string; color: string }> = [
  { value: 'all', label: 'All', color: 'gray' },
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'pending', label: 'Pending', color: 'orange' },
  { value: 'expired', label: 'Expired', color: 'gray' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
];

export const AdCentre = () => {
  const dispatch = useAppDispatch();
  const {
    boosts,
    statistics,
    filters,
    pagination,
    isLoading,
    isLoadingStats,
    isLoadingDetails,
    currentBoost,
    isProcessing,
    error,
  } = useAppSelector((state) => state.adCentre);

  const [selectedBoostId, setSelectedBoostId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [lastSyncAction, setLastSyncAction] = useState<'sync' | 'create' | 'cancel' | null>(null);
  const { success: toastSuccess, error: toastError } = useToastContext();

  // Fetch statistics on mount
  useEffect(() => {
    dispatch(fetchStatisticsRequest());
  }, [dispatch]);

  // Track sync expiry success
  useEffect(() => {
    if (lastSyncAction === 'sync' && !isProcessing && !error) {
      toastSuccess('Expiry check completed successfully. Boost list refreshed.');
      setLastSyncAction(null);
    }
  }, [isProcessing, error, lastSyncAction, toastSuccess]);

  // Fetch boosts when filters or page changes
  useEffect(() => {
    dispatch(
      fetchBoostsRequest({
        filters,
        page: pagination.page,
        limit: pagination.limit,
        sort: 'createdAt',
      })
    );
  }, [dispatch, filters.status, filters.search, pagination.page]);

  // Fetch boost details when selected
  useEffect(() => {
    if (selectedBoostId) {
      dispatch(fetchBoostDetailsRequest(selectedBoostId));
      setIsModalOpen(true);
    }
  }, [selectedBoostId, dispatch]);

  const handleBoostClick = (boostId: string) => {
    setSelectedBoostId(boostId);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBoostId(null);
    dispatch(clearCurrentBoost());
  };

  const handleApprove = (boostId: string) => {
    dispatch(approveBoostRequest(boostId));
    setTimeout(() => {
      handleCloseModal();
    }, 1000);
  };

  const handleReject = (boostId: string) => {
    setSelectedBoostId(boostId);
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (selectedBoostId) {
      dispatch(rejectBoostRequest({ boostId: selectedBoostId, reason: rejectionReason }));
      setShowRejectModal(false);
      setRejectionReason('');
      setTimeout(() => {
        handleCloseModal();
      }, 1000);
    }
  };

  const handleFilterChange = (status: BoostFilters['status']) => {
    dispatch(setFilters({ status }));
  };

  const handleSearchChange = (search: string) => {
    dispatch(setFilters({ search }));
  };

  const getStatusBadge = (status: Boost['status']) => {
    const statusConfig = statusOptions.find((opt) => opt.value === status) || statusOptions[0];
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          statusConfig.value === 'active'
            ? 'bg-green-100 text-green-800'
            : statusConfig.value === 'pending'
            ? 'bg-orange-100 text-orange-800'
            : statusConfig.value === 'rejected'
            ? 'bg-red-100 text-red-800'
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        {statusConfig.label}
      </span>
    );
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCreateBoost = (data: { astrologerId: string; durationDays: number; startDate?: string }) => {
    dispatch(createBoostRequest(data));
    setShowCreateModal(false);
  };

  const handleCancelBoost = (boostId: string) => {
    setSelectedBoostId(boostId);
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    if (selectedBoostId && cancellationReason.trim()) {
      dispatch(cancelBoostRequest({ boostId: selectedBoostId, reason: cancellationReason }));
      setShowCancelModal(false);
      setCancellationReason('');
      setTimeout(() => {
        handleCloseModal();
      }, 1000);
    }
  };

  const handleSyncExpiry = () => {
    setLastSyncAction('sync');
    dispatch(triggerExpiryRequest());
  };

  // Show toast notifications for actions
  useEffect(() => {
    if (!isProcessing && error) {
      toastError(error);
    }
  }, [error, isProcessing, toastError]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Ad Centre"
          subtitle="Manage profile boosts and advertising campaigns"
          action={
            <div className="flex gap-3">
              <button
                onClick={handleSyncExpiry}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                Sync Expiry
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Create Boost
              </button>
            </div>
          }
        />

        {/* Statistics Cards */}
        {isLoadingStats ? (
          <div className="flex justify-center py-8">
            <Loader />
          </div>
        ) : statistics ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Boosts</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {statistics.totalActiveBoosts}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {statistics.totalPendingBoosts}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {statistics.averageBoostDuration.toFixed(1)} days
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Boosted</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {statistics.topBoostedAstrologers.length}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Status Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleFilterChange(option.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filters.status === option.value
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by astrologer name..."
                  value={filters.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Boosts List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        ) : boosts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Boosts Found</h3>
            <p className="text-gray-600">
              {filters.status !== 'all'
                ? `No ${filters.status} boosts found.`
                : 'No boosts have been requested yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boosts.map((boost) => (
              <div
                key={boost.boostId}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleBoostClick(boost.boostId)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {boost.astrologerAvatar ? (
                      <img
                        src={boost.astrologerAvatar}
                        alt={boost.astrologerName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <span className="text-purple-600 font-semibold">
                          {boost.astrologerName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{boost.astrologerName}</h3>
                      <p className="text-sm text-gray-500">{boost.astrologerPhone}</p>
                    </div>
                  </div>
                  {getStatusBadge(boost.status)}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium text-gray-900">{boost.durationDays} days</span>
                  </div>
                  {boost.status === 'active' && (
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-gray-600">Time Remaining:</span>
                      <CountdownTimer endDate={boost.endDate} className="text-sm" />
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Cost:</span>
                    <span className="font-medium text-gray-900">
                      ₹{boost.totalCost.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Start Date:</span>
                    <span className="font-medium text-gray-900">{formatDateTime(boost.startDate)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">End Date:</span>
                    <span className="font-medium text-gray-900">{formatDateTime(boost.endDate)}</span>
                  </div>
                </div>

                {(boost.status === 'pending' || boost.status === 'active') && (
                  <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                    {boost.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(boost.boostId)}
                          disabled={isProcessing}
                          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(boost.boostId)}
                          disabled={isProcessing}
                          className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {boost.status === 'active' && (
                      <button
                        onClick={() => handleCancelBoost(boost.boostId)}
                        disabled={isProcessing}
                        className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        Cancel Boost
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => dispatch(setPage(pagination.page - 1))}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => dispatch(setPage(pagination.page + 1))}
                disabled={pagination.page >= pagination.pages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Boost Detail Modal */}
        {isModalOpen && currentBoost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Boost Details</h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {isLoadingDetails ? (
                <div className="flex justify-center py-12">
                  <Loader />
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  {/* Astrologer Info */}
                  {currentBoost.astrologer && (
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Astrologer Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Name</p>
                          <p className="font-medium text-gray-900">{currentBoost.astrologer.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium text-gray-900">
                            {currentBoost.astrologer.email}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium text-gray-900">
                            {currentBoost.astrologer.phone}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Experience</p>
                          <p className="font-medium text-gray-900">
                            {currentBoost.astrologer.experience} years
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Rate per Minute</p>
                          <p className="font-medium text-gray-900">
                            ₹{currentBoost.astrologer.ratePerMinute}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Earnings</p>
                          <p className="font-medium text-gray-900">
                            ₹{currentBoost.astrologer.totalEarnings.toFixed(0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Boost Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Boost Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <div className="mt-1">{getStatusBadge(currentBoost.status)}</div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="font-medium text-gray-900">{currentBoost.durationDays} days</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Daily Cost</p>
                        <p className="font-medium text-gray-900">₹{currentBoost.dailyCost}/day</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Cost</p>
                        <p className="font-medium text-gray-900">₹{currentBoost.totalCost.toFixed(0)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Start Date</p>
                        <p className="font-medium text-gray-900">{formatDateTime(currentBoost.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">End Date</p>
                        <p className="font-medium text-gray-900">{formatDateTime(currentBoost.endDate)}</p>
                      </div>
                      {currentBoost.status === 'active' && (
                        <div className="col-span-2">
                          <p className="text-sm text-gray-600 mb-2">Time Remaining</p>
                          <CountdownTimer endDate={currentBoost.endDate} className="text-lg" />
                        </div>
                      )}
                      {currentBoost.status === 'active' && (
                        <div className="col-span-2">
                          <p className="text-sm text-gray-600 mb-2">Progress</p>
                          <BoostProgressBar
                            startDate={currentBoost.startDate}
                            endDate={currentBoost.endDate}
                          />
                        </div>
                      )}
                      {currentBoost.approvedAt && (
                        <div className="col-span-2">
                          <p className="text-sm text-gray-600">Approved By</p>
                          <p className="font-medium text-gray-900">
                            Admin on {formatDateTime(currentBoost.approvedAt)}
                          </p>
                        </div>
                      )}
                      {currentBoost.rejectedAt && (
                        <div className="col-span-2">
                          <p className="text-sm text-gray-600">Rejected By</p>
                          <p className="font-medium text-gray-900">
                            Admin on {formatDateTime(currentBoost.rejectedAt)}
                          </p>
                          {currentBoost.rejectionReason && (
                            <p className="text-sm text-red-600 mt-1">Reason: {currentBoost.rejectionReason}</p>
                          )}
                        </div>
                      )}
                      {currentBoost.cancelledAt && (
                        <div className="col-span-2">
                          <p className="text-sm text-gray-600">Cancelled By</p>
                          <p className="font-medium text-gray-900">
                            Admin on {formatDateTime(currentBoost.cancelledAt)}
                          </p>
                          {currentBoost.cancellationReason && (
                            <p className="text-sm text-orange-600 mt-1">Reason: {currentBoost.cancellationReason}</p>
                          )}
                        </div>
                      )}
                      {currentBoost.createdByAdmin && (
                        <div className="col-span-2">
                          <p className="text-sm text-gray-600">Created By</p>
                          <p className="font-medium text-purple-600">Admin</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {(currentBoost.status === 'pending' || currentBoost.status === 'active') && (
                    <div className="flex gap-4 pt-4 border-t border-gray-200">
                      {currentBoost.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(currentBoost.boostId)}
                            disabled={isProcessing}
                            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                          >
                            Approve Boost
                          </button>
                          <button
                            onClick={() => handleReject(currentBoost.boostId)}
                            disabled={isProcessing}
                            className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                          >
                            Reject Boost
                          </button>
                        </>
                      )}
                      {currentBoost.status === 'active' && (
                        <button
                          onClick={() => handleCancelBoost(currentBoost.boostId)}
                          disabled={isProcessing}
                          className="flex-1 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                          Cancel Boost
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
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
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Active Boost</h3>
              <p className="text-sm text-gray-600 mb-4">
                Please provide a reason for cancelling this boost (required):
              </p>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Enter cancellation reason..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent mb-4"
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
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Cancel Boost
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Boost Modal */}
        <CreateBoostModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateBoost}
          isProcessing={isProcessing}
        />
      </div>
    </MainLayout>
  );
};

