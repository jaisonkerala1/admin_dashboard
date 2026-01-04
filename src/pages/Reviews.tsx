import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Star,
  MessageSquare,
  Eye,
  EyeOff,
  Shield,
  Trash2,
  ThumbsUp,
  Plus,
  Edit2,
  Reply
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Card, EmptyState, RoundAvatar, PillBadge, ShowEntriesDropdown, StatCard, SearchBar, Modal, StatCardSkeleton } from '@/components/common';
import { SkeletonBox, SkeletonCard, SkeletonCircle } from '@/components/common/Skeleton';
import { ReviewFormModal } from '@/components/reviews/ReviewFormModal';
import { ReplyModal } from '@/components/reviews/ReplyModal';
import { reviewsApi } from '@/api';
import { Review } from '@/types';
import { formatDateTime } from '@/utils/formatters';
import { useToastContext } from '@/contexts/ToastContext';
import { RootState } from '@/store';
import {
  fetchReviewsRequest,
  setFilter,
  setSearch,
  setEntriesPerPage,
  setCurrentPage,
  toggleSelection,
  selectAll,
  deselectAll,
  ReviewFilter,
} from '@/store/slices/reviewsSlice';
import { ROUTES } from '@/utils/constants';

export const Reviews = () => {
  const dispatch = useDispatch();
  const toast = useToastContext();
  const { 
    reviews, 
    isLoading, 
    filter, 
    search, 
    entriesPerPage, 
    currentPage, 
    totalPages,
    selectedIds, 
    stats 
  } = useSelector((state: RootState) => state.reviews);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [replyingToReview, setReplyingToReview] = useState<Review | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [moderationReason, setModerationReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchReviewsRequest());
  }, [dispatch, filter, search, currentPage, entriesPerPage]);

  const handleReviewModalSuccess = () => {
    dispatch(fetchReviewsRequest());
  };

  const handleDeleteReview = async () => {
    if (!deletingReviewId) return;
    
    const review = reviews.find(r => r._id === deletingReviewId);
    const isUserReview = review && !review.isAdminCreated;
    
    // If user-created review, require moderation reason
    if (isUserReview && !moderationReason.trim()) {
      toast.error('Moderation reason is required for user-created reviews');
      return;
    }
    
    setIsDeleting(true);
    try {
      await reviewsApi.delete(deletingReviewId, {
        moderationReason: isUserReview ? moderationReason.trim() : undefined
      });
      toast.success('Review deleted successfully');
      setDeletingReviewId(null);
      setModerationReason('');
      dispatch(fetchReviewsRequest());
    } catch (error: any) {
      console.error('Failed to delete review:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete review');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    const selectedReviews = reviews.filter(r => selectedIds.includes(r._id));
    const hasUserReviews = selectedReviews.some(r => !r.isAdminCreated);

    // If user-created review exists in selection, require moderation reason
    if (hasUserReviews && !moderationReason.trim()) {
      toast.error('Moderation reason is required when deleting user-created reviews');
      return;
    }

    setIsDeleting(true);
    try {
      const response = await reviewsApi.bulkDelete(selectedIds, hasUserReviews ? moderationReason.trim() : undefined);
      toast.success(response.data?.message || `${selectedIds.length} reviews deleted successfully`);
      setShowBulkDeleteModal(false);
      setModerationReason('');
      dispatch(deselectAll());
      dispatch(fetchReviewsRequest());
    } catch (error: any) {
      console.error('Failed to bulk delete reviews:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete reviews');
    } finally {
      setIsDeleting(false);
    }
  };

  // Pagination
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedReviews = reviews;

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      dispatch(selectAll(paginatedReviews.map(r => r._id)));
    } else {
      dispatch(deselectAll());
    }
  };

  const handleSelectOne = (id: string) => {
    dispatch(toggleSelection(id));
  };

  const isAllSelected = paginatedReviews.length > 0 && paginatedReviews.every(r => selectedIds.includes(r._id));
  const isSomeSelected = paginatedReviews.some(r => selectedIds.includes(r._id)) && !isAllSelected;

  // Helper functions
  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star 
            key={i} 
            className={`w-4 h-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
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
            <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
            <p className="text-gray-500 mt-1">Manage all reviews and ratings on the platform</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Bar */}
            <div className="w-full md:w-80">
              <SearchBar
                placeholder="Search reviews, clients..."
                value={search}
                onSearch={(query) => dispatch(setSearch(query))}
                onClear={() => dispatch(setSearch(''))}
              />
            </div>
            
            {/* Add Review Button */}
            <button
              onClick={() => {
                setEditingReview(null);
                setShowReviewModal(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Add Review
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard
              title="Total"
              value={stats.total}
              icon={MessageSquare}
            />
            <StatCard
              title="Avg Rating"
              value={stats.averageRating.toFixed(1)}
              icon={Star}
            />
            <StatCard
              title="Needs Reply"
              value={stats.needsReply}
              icon={MessageSquare}
              iconColor="text-amber-600"
              iconBgColor="bg-amber-50"
            />
            <StatCard
              title="Pending Moderation"
              value={stats.pendingModeration}
              icon={Shield}
              iconColor="text-orange-600"
              iconBgColor="bg-orange-50"
            />
            <StatCard
              title="Public"
              value={stats.public}
              icon={Eye}
              iconColor="text-green-600"
              iconBgColor="bg-green-50"
            />
            <StatCard
              title="Negative"
              value={stats.negative}
              icon={Star}
              iconColor="text-red-600"
              iconBgColor="bg-red-50"
            />
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      {isLoading ? (
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-8 overflow-x-auto pb-3">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <SkeletonBox key={i} width={140} height={20} radius={4} className="shimmer" />
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-8 overflow-x-auto">
            {[
              { key: 'all', label: 'All Reviews', count: stats.total },
              { key: 'needsReply', label: 'Needs Reply', count: stats.needsReply },
              { key: 'pendingModeration', label: 'Pending Moderation', count: stats.pendingModeration },
              { key: 'public', label: 'Public', count: stats.public },
              { key: 'hidden', label: 'Hidden / Flagged', count: stats.hidden },
              { key: 'negative', label: 'Negative (1-2 Stars)', count: stats.negative },
              { key: 'adminCreated', label: 'Admin Created', count: stats.adminCreated },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => dispatch(setFilter(key as ReviewFilter))}
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
      )}

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
              {selectedIds.length > 0 ? `${selectedIds.length} selected` : 'Select all'}
            </span>
            {selectedIds.length > 0 && (
              <button 
                onClick={() => {
                  setModerationReason('');
                  setShowBulkDeleteModal(true);
                }}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
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
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonCard key={i}>
                <div className="flex items-center gap-4">
                  <SkeletonBox width={16} height={16} radius={4} />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <SkeletonBox width={120} height={16} radius={4} />
                      <SkeletonBox width={60} height={20} radius={4} />
                    </div>
                    <div className="flex items-center gap-3">
                      <SkeletonCircle size={40} />
                      <SkeletonBox width={150} height={14} radius={4} />
                    </div>
                    <SkeletonBox width={200} height={14} radius={4} />
                  </div>
                  <div className="flex gap-2">
                    <SkeletonBox width={60} height={24} radius={4} />
                    <SkeletonBox width={32} height={32} radius={8} />
                    <SkeletonBox width={32} height={32} radius={8} />
                  </div>
                </div>
              </SkeletonCard>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No reviews found"
            description="No reviews match your current filters"
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
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Astrologer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rating</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Review</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedReviews.map((review) => (
                    <tr key={review._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(review._id)}
                          onChange={() => handleSelectOne(review._id)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{review.clientName}</p>
                          {review.isAdminCreated && (
                            <PillBadge variant="blue" label="Admin" showDot={false} />
                          )}
                          {review.customCreatedAt && (
                            <PillBadge variant="purple" label="Custom Date" showDot={false} />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {review.astrologerId ? (
                          <Link 
                            to={`${ROUTES.ASTROLOGERS}/${review.astrologerId._id}`}
                            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                          >
                            <RoundAvatar
                              src={review.astrologerId.profilePicture}
                              name={review.astrologerId.name}
                              size="sm"
                            />
                            <span className="font-medium text-gray-900 hover:text-blue-600">
                              {review.astrologerId.name}
                            </span>
                          </Link>
                        ) : (
                          <span className="text-gray-400 text-sm">Unknown</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {getRatingStars(review.rating)}
                          <span className="text-sm font-medium text-gray-900">{review.rating}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-900 max-w-xs truncate">{review.reviewText}</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {formatDateTime(review.customCreatedAt || review.createdAt)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {review.isVerified && <PillBadge variant="approved" label="Verified" showDot={false} />}
                          {review.isPublic ? (
                            <PillBadge variant="active" label="Public" showDot={false} />
                          ) : (
                            <PillBadge variant="inactive" label="Hidden" showDot={false} />
                          )}
                          {review.isModerated && !review.isAdminCreated && (
                            <PillBadge variant="pending" label="Moderated" showDot={false} />
                          )}
                          {review.isAdminCreated && (
                            <PillBadge variant="blue" label="Admin" showDot={false} />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setReplyingToReview(review)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title={review.astrologerReply ? 'Edit Reply' : 'Reply'}
                          >
                            {review.astrologerReply ? (
                              <MessageSquare className="w-4 h-4 fill-current" />
                            ) : (
                              <Reply className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setEditingReview(review);
                              setShowReviewModal(true);
                            }}
                            className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDeletingReviewId(review._id);
                              setModerationReason('');
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tablet & Mobile View */}
            <div className="lg:hidden space-y-4">
              {paginatedReviews.map((review) => (
              <div
                key={review._id}
                  className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-200 ease-out shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(review._id)}
                      onChange={() => handleSelectOne(review._id)}
                      className="w-4 h-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                    <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">{review.clientName}</p>
                            {review.isAdminCreated && (
                              <PillBadge variant="blue" label="Admin" showDot={false} />
                            )}
                            {review.customCreatedAt && (
                              <PillBadge variant="purple" label="Custom Date" showDot={false} />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {getRatingStars(review.rating)}
                            <span className="text-sm font-medium text-gray-700">{review.rating}</span>
                    </div>
                  </div>
                        <div className="flex items-center gap-2">
                          {review.isVerified && <PillBadge variant="approved" label="✓" showDot={false} />}
                          {review.isPublic ? (
                            <Eye className="w-4 h-4 text-gray-600" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          )}
                          <button
                            onClick={() => setReplyingToReview(review)}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title={review.astrologerReply ? 'Edit Reply' : 'Reply'}
                          >
                            {review.astrologerReply ? (
                              <MessageSquare className="w-4 h-4 fill-current" />
                            ) : (
                              <Reply className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setEditingReview(review);
                              setShowReviewModal(true);
                            }}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDeletingReviewId(review._id);
                              setModerationReason('');
                            }}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                  </div>
                </div>
                
                      {review.astrologerId && (
                        <Link 
                          to={`${ROUTES.ASTROLOGERS}/${review.astrologerId._id}`}
                          className="flex items-center gap-2 mb-3 hover:opacity-80"
                        >
                          <RoundAvatar
                            src={review.astrologerId.profilePicture}
                            name={review.astrologerId.name}
                            size="sm"
                          />
                          <div>
                            <p className="text-xs text-gray-500">Astrologer</p>
                            <p className="text-sm font-medium text-gray-900 hover:text-gray-700">
                              {review.astrologerId.name}
                            </p>
                  </div>
                        </Link>
                      )}
                      
                      <p className="text-sm text-gray-700 mb-3 line-clamp-3">{review.reviewText}</p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{formatDateTime(review.customCreatedAt || review.createdAt)}</span>
                        {review.helpfulCount > 0 && (
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" />
                            <span>{review.helpfulCount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                </div>
              </div>
            ))}
          </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {startIndex + 1}-{startIndex + reviews.length} of {stats.total} reviews
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

      {/* Review Form Modal */}
      <ReviewFormModal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setEditingReview(null);
        }}
        onSuccess={handleReviewModalSuccess}
        review={editingReview || undefined}
      />

      {/* Reply Modal */}
      {replyingToReview && (
        <ReplyModal
          isOpen={!!replyingToReview}
          onClose={() => setReplyingToReview(null)}
          onSuccess={handleReviewModalSuccess}
          review={replyingToReview}
        />
      )}

      {/* Delete Review Confirmation Modal */}
      <Modal
        isOpen={!!deletingReviewId}
        onClose={() => {
          if (!isDeleting) {
            setDeletingReviewId(null);
            setModerationReason('');
          }
        }}
        title="Delete Review"
      >
        <div className="space-y-4">
          {(() => {
            const review = reviews.find(r => r._id === deletingReviewId);
            const isUserReview = review && !review.isAdminCreated;
            
            return (
              <>
                <p className="text-gray-600">
                  Are you sure you want to delete this review? This action cannot be undone.
                </p>
                
                {isUserReview && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Moderation Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={moderationReason}
                      onChange={(e) => setModerationReason(e.target.value)}
                      placeholder="Please provide a reason for deleting this user-created review..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                      rows={3}
                      maxLength={500}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {moderationReason.length}/500 characters
                    </p>
                  </div>
                )}
                
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setDeletingReviewId(null);
                      setModerationReason('');
                    }}
                    disabled={isDeleting}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteReview}
                    disabled={isDeleting || (isUserReview && !moderationReason.trim())}
                    className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      </Modal>

      {/* Bulk Delete Confirmation Modal */}
      <Modal
        isOpen={showBulkDeleteModal}
        onClose={() => {
          if (!isDeleting) {
            setShowBulkDeleteModal(false);
            setModerationReason('');
          }
        }}
        title="Bulk Delete Reviews"
      >
        <div className="space-y-4">
          {(() => {
            const selectedReviews = reviews.filter(r => selectedIds.includes(r._id));
            const hasUserReviews = selectedReviews.some(r => !r.isAdminCreated);
            
            return (
              <>
                <p className="text-gray-600">
                  Are you sure you want to delete <span className="font-bold text-gray-900">{selectedIds.length}</span> selected reviews? This action cannot be undone.
                </p>
                
                {hasUserReviews && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Moderation Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={moderationReason}
                      onChange={(e) => setModerationReason(e.target.value)}
                      placeholder="Please provide a reason for deleting these user-created reviews..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                      rows={3}
                      maxLength={500}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {moderationReason.length}/500 characters
                    </p>
                  </div>
                )}
                
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowBulkDeleteModal(false);
                      setModerationReason('');
                    }}
                    disabled={isDeleting}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    disabled={isDeleting || (hasUserReviews && !moderationReason.trim())}
                    className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? 'Deleting...' : `Delete ${selectedIds.length} Reviews`}
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      </Modal>
    </MainLayout>
  );
};
