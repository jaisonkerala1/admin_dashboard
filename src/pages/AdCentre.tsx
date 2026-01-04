import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchBoostsRequest,
  createBoostRequest,
  triggerExpiryRequest,
  fetchStatisticsRequest,
  setFilters,
  setPage,
} from '@/store/slices/adCentreSlice';
import { CountdownTimer, StatCard, Card, StatCardSkeleton, SkeletonBox } from '@/components/common';
import { CreateBoostModal } from '@/components/adCentre/CreateBoostModal';
import { BoostCardSkeleton } from '@/components/adCentre/BoostCardSkeleton';
import { useToastContext } from '@/contexts/ToastContext';
import { getImageUrl } from '@/utils/helpers';
import { TrendingUp, XCircle, Clock, Plus, RefreshCw, Zap, Users, Search, X } from 'lucide-react';
import type { Boost, BoostFilters } from '@/store/slices/adCentreSlice';
import { ROUTES } from '@/utils/constants';

const statusOptions: Array<{ value: BoostFilters['status']; label: string; color: string }> = [
  { value: 'all', label: 'All', color: 'gray' },
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'pending', label: 'Pending', color: 'orange' },
  { value: 'expired', label: 'Expired', color: 'gray' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
  { value: 'cancelled_by_user', label: 'Cancelled by User', color: 'blue' },
  { value: 'cancelled_by_admin', label: 'Cancelled by Admin', color: 'purple' },
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
    isProcessing,
    error,
  } = useAppSelector((state) => state.adCentre);

  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [lastSyncAction, setLastSyncAction] = useState<'sync' | 'create' | 'cancel' | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const { success: toastSuccess, error: toastError } = useToastContext();

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: '🌟 General' },
    { value: 'astrology', label: '🔮 Astrology' },
    { value: 'tarot', label: '🃏 Tarot' },
    { value: 'numerology', label: '🔢 Numerology' },
    { value: 'palmistry', label: '👋 Palmistry' },
    { value: 'healing', label: '✨ Healing' },
    { value: 'meditation', label: '🧘 Meditation' },
    { value: 'spiritual', label: '🙏 Spiritual' },
  ];

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
    const filtersWithCategory = {
      ...filters,
      category: selectedCategoryFilter !== 'all' ? selectedCategoryFilter : undefined,
    };
    dispatch(
      fetchBoostsRequest({
        filters: filtersWithCategory,
        page: pagination.page,
        limit: pagination.limit,
        sort: 'createdAt',
      })
    );
  }, [dispatch, filters.status, filters.search, filters.startDateFrom, pagination.page, selectedCategoryFilter]);

  // Initialize date range on mount
  useEffect(() => {
    if (filters.startDateFrom) {
      // Determine which chip should be selected based on startDateFrom
      const startDate = new Date(filters.startDateFrom);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 7) setSelectedDateRange('7d');
      else if (diffDays <= 30) setSelectedDateRange('1m');
      else if (diffDays <= 90) setSelectedDateRange('3m');
      else if (diffDays <= 180) setSelectedDateRange('6m');
      else if (diffDays <= 365) setSelectedDateRange('1y');
      else setSelectedDateRange('all');
    } else {
      setSelectedDateRange('all');
    }
  }, [filters.startDateFrom]);

  const handleBoostClick = (boostId: string) => {
    navigate(`${ROUTES.AD_CENTRE}/${boostId}`);
  };

  const handleFilterChange = (status: BoostFilters['status']) => {
    dispatch(setFilters({ status }));
  };

  const handleSearchChange = (search: string) => {
    dispatch(setFilters({ search }));
  };

  const handleDateRangeChange = (range: string) => {
    setSelectedDateRange(range);
    let startDateFrom: string | undefined;

    if (range !== 'all') {
      const now = new Date();
      const startDate = new Date();

      switch (range) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          startDateFrom = startDate.toISOString().split('T')[0];
          break;
        case '1m':
          startDate.setMonth(now.getMonth() - 1);
          startDateFrom = startDate.toISOString().split('T')[0];
          break;
        case '3m':
          startDate.setMonth(now.getMonth() - 3);
          startDateFrom = startDate.toISOString().split('T')[0];
          break;
        case '6m':
          startDate.setMonth(now.getMonth() - 6);
          startDateFrom = startDate.toISOString().split('T')[0];
          break;
        case '1y':
          startDate.setFullYear(now.getFullYear() - 1);
          startDateFrom = startDate.toISOString().split('T')[0];
          break;
        default:
          startDateFrom = undefined;
      }
    }

    dispatch(setFilters({
      startDateFrom,
      minCost: undefined,
      maxCost: undefined,
      minDuration: undefined,
      maxDuration: undefined,
      startDateTo: undefined,
      endDateFrom: undefined,
      endDateTo: undefined,
    }));
  };

  const getStatusBadge = (status: Boost['status']) => {
    const statusConfig = statusOptions.find((opt) => opt.value === status) || statusOptions[0];
    // Monochrome design - subtle grays with slight variations
    const statusStyles: Record<string, string> = {
      active: 'bg-gray-900 text-white',
      pending: 'bg-gray-200 text-gray-700',
      expired: 'bg-gray-100 text-gray-600',
      rejected: 'bg-gray-200 text-gray-700',
      cancelled_by_user: 'bg-gray-100 text-gray-600',
      cancelled_by_admin: 'bg-gray-200 text-gray-700',
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          statusStyles[status] || 'bg-gray-100 text-gray-600'
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

  const handleCreateBoost = (data: { astrologerId: string; durationDays: number; startDate?: string; categories: string[] }) => {
    dispatch(createBoostRequest(data));
    setShowCreateModal(false);
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
            <div className="flex gap-2">
              <button
                onClick={handleSyncExpiry}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                Sync Expiry
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Create Boost
              </button>
            </div>
          }
        />

        {/* Statistics Cards - Dashboard Style */}
        {isLoadingStats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        ) : statistics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Active Boosts"
              value={statistics.totalActiveBoosts}
              icon={Zap}
              iconColor="text-gray-600"
              iconBgColor="bg-gray-50"
            />
            <StatCard
              title="Pending Approvals"
              value={statistics.totalPendingBoosts}
              icon={Clock}
              iconColor="text-gray-600"
              iconBgColor="bg-gray-50"
            />
            <StatCard
              title="Avg Duration"
              value={`${statistics.averageBoostDuration.toFixed(1)} days`}
              icon={TrendingUp}
              iconColor="text-gray-600"
              iconBgColor="bg-gray-50"
            />
            <StatCard
              title="Total Boosted"
              value={statistics.topBoostedAstrologers.length}
              icon={Users}
              iconColor="text-gray-600"
              iconBgColor="bg-gray-50"
            />
          </div>
        ) : null}

        {/* Filters - Dashboard Style */}
        {isLoading ? (
          <Card>
            <div className="space-y-4">
              {/* Status Filter Tabs Skeleton */}
              <div className="border-b border-gray-200">
                <div className="flex gap-6 overflow-x-auto pb-3">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <SkeletonBox key={i} width={100} height={24} radius={4} className="shimmer" />
                  ))}
                </div>
              </div>
              {/* Search Bar Skeleton */}
              <div className="max-w-md">
                <SkeletonBox width="100%" height={44} radius={22} className="shimmer" />
              </div>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="space-y-4">
              {/* Status Filter Tabs - Dashboard Style */}
              <div className="border-b border-gray-200">
                <div className="flex gap-6 overflow-x-auto">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleFilterChange(option.value)}
                      className={`pb-3 px-1 border-b-2 whitespace-nowrap transition-colors ${
                        filters.status === option.value
                          ? 'border-gray-900 text-gray-900 font-semibold'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Bar with Date Range Filters */}
              <div className="flex items-center gap-3">
                {/* Search Bar - Universal Search Style (Small) */}
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <div className="relative h-[44px] bg-white rounded-full border border-gray-200/50 shadow-sm transition-all duration-200 hover:shadow-md focus-within:shadow-md focus-within:border-gray-300">
                      {/* Search Icon */}
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <Search
                          className={`w-4 h-4 transition-colors ${
                            filters.search ? 'text-gray-700' : 'text-gray-400'
                          }`}
                        />
                      </div>

                      {/* Input */}
                      <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Search by astrologer name..."
                        className="w-full h-full pl-10 pr-10 bg-transparent rounded-full text-gray-900 placeholder:text-gray-400 text-sm font-medium focus:outline-none focus:ring-0"
                      />

                      {/* Clear Button */}
                      {filters.search && (
                        <button
                          type="button"
                          onClick={() => handleSearchChange('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                          aria-label="Clear search"
                        >
                          <X className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Date Range Filter Chips */}
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { value: 'all', label: 'All' },
                    { value: '7d', label: '7 Days' },
                    { value: '1m', label: '1 Month' },
                    { value: '3m', label: '3 Months' },
                    { value: '6m', label: '6 Months' },
                    { value: '1y', label: '1 Year' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleDateRangeChange(option.value)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                        selectedDateRange === option.value
                          ? 'bg-gray-900 text-white shadow-sm'
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Category:</label>
                  <select
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  >
                    {categoryOptions.map((option: { value: string; label: string }) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Boosts List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <BoostCardSkeleton />
            <BoostCardSkeleton />
            <BoostCardSkeleton />
            <BoostCardSkeleton />
            <BoostCardSkeleton />
            <BoostCardSkeleton />
          </div>
        ) : error ? (
          <Card>
            <div className="flex items-center gap-2 text-gray-700">
              <XCircle className="w-5 h-5 text-gray-500" />
              <span>{error}</span>
            </div>
          </Card>
        ) : boosts.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Boosts Found</h3>
              <p className="text-gray-500 text-sm">
                {filters.status !== 'all'
                  ? `No ${filters.status} boosts found.`
                  : 'No boosts have been requested yet.'}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {boosts.map((boost) => (
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
                          // Hide broken image and show fallback
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
                  {boost.status === 'active' && (
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-gray-500">Time Remaining:</span>
                      <CountdownTimer endDate={boost.endDate} className="text-xs font-medium" />
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Cost:</span>
                    <span className="font-medium text-gray-900">
                      ₹{boost.totalCost.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Start:</span>
                    <span className="font-medium text-gray-700">{formatDateTime(boost.startDate)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">End:</span>
                    <span className="font-medium text-gray-700">{formatDateTime(boost.endDate)}</span>
                  </div>
                  {boost.categories && boost.categories.length > 0 && (
                    <div className="pt-2">
                      <div className="flex flex-wrap gap-1">
                        {boost.categories.map((category) => {
                          const categoryLabels: Record<string, string> = {
                            general: '🌟',
                            astrology: '🔮',
                            tarot: '🃏',
                            numerology: '🔢',
                            palmistry: '👋',
                            healing: '✨',
                            meditation: '🧘',
                            spiritual: '🙏',
                          };
                          return (
                            <span
                              key={category}
                              className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium border border-purple-200"
                            >
                              {categoryLabels[category] || ''} {category.charAt(0).toUpperCase() + category.slice(1)}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                </Card>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <Card>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
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
          </Card>
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

