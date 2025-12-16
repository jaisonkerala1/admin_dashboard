import { useEffect, useState, useCallback } from 'react';
import { 
  Search, 
  Star,
  MessageSquare,
  Eye,
  EyeOff,
  Shield,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
  Calendar,
  ThumbsUp
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, Loader, EmptyState, Avatar } from '@/components/common';
import { reviewsApi } from '@/api';
import { Review } from '@/types';
import { formatDateTime, formatNumber } from '@/utils/formatters';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const loadReviews = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      const params: any = { 
        page, 
        limit: pagination.limit,
        sortBy: 'createdAt', 
        sortOrder: 'desc' 
      };
      
      if (search) params.search = search;
      
      const response = await reviewsApi.getAll(params);
      
      setReviews(response.data || []);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setIsLoading(false);
    }
  }, [search, pagination.limit]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      loadReviews(1);
    }, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      loadReviews(newPage);
    }
  };

  // Calculate stats
  const stats = {
    total: pagination.total,
    verified: reviews.filter(r => r.isVerified).length,
    moderated: reviews.filter(r => r.isModerated).length,
    public: reviews.filter(r => r.isPublic).length,
    averageRating: reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
      : '0',
    rating5: reviews.filter(r => r.rating === 5).length,
  };

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

  return (
    <MainLayout>
      <PageHeader
        title="Reviews Management"
        subtitle={`Manage all reviews and ratings • ${pagination.total} total`}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        <Card className="!p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-600">Total Reviews</p>
            </div>
          </div>
        </Card>
        
        <Card className="!p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
              <p className="text-xs text-gray-600">Avg Rating</p>
            </div>
          </div>
        </Card>
        
        <Card className="!p-4 border-l-4 border-l-green-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.verified}</p>
              <p className="text-xs text-gray-600">Verified</p>
            </div>
          </div>
        </Card>
        
        <Card className="!p-4 border-l-4 border-l-indigo-500">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-indigo-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.public}</p>
              <p className="text-xs text-gray-600">Public</p>
            </div>
          </div>
        </Card>
        
        <Card className="!p-4 border-l-4 border-l-purple-500">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.moderated}</p>
              <p className="text-xs text-gray-600">Moderated</p>
            </div>
          </div>
        </Card>
        
        <Card className="!p-4 border-l-4 border-l-yellow-500">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-600 fill-yellow-400" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.rating5}</p>
              <p className="text-xs text-gray-600">5 Stars</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            onClick={() => loadReviews(pagination.page)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 border border-gray-300 rounded-md transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Reviews List */}
        {isLoading ? (
          <div className="py-12">
            <Loader size="lg" text="Loading reviews..." />
          </div>
        ) : reviews.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No reviews found"
            description="No reviews match your current filters"
          />
        ) : (
          <>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-indigo-200 transition-colors cursor-pointer"
                  onClick={() => setSelectedReview(review)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar name={review.clientName} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900">{review.clientName}</p>
                          {review.isVerified && (
                            <CheckCircle2 className="w-4 h-4 text-green-600" title="Verified" />
                          )}
                        </div>
                        {review.astrologerId && (
                          <p className="text-sm text-gray-600">
                            Reviewed {review.astrologerId.name}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">{formatDateTime(review.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getRatingStars(review.rating)}
                      <div className="flex items-center gap-2">
                        {!review.isPublic && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-xs font-medium border border-gray-200">
                            <EyeOff className="w-3 h-3" />
                            Hidden
                          </span>
                        )}
                        {review.isModerated && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md text-xs font-medium border border-purple-200">
                            <Shield className="w-3 h-3" />
                            Moderated
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3 line-clamp-2">{review.reviewText}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {review.helpfulCount} helpful
                    </span>
                    {review.astrologerReply && (
                      <span className="flex items-center gap-1 text-indigo-600">
                        <MessageSquare className="w-3 h-3" />
                        Astrologer replied
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} reviews
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
      {selectedReview && (
        <ReviewDetailModal
          review={selectedReview}
          onClose={() => setSelectedReview(null)}
        />
      )}
    </MainLayout>
  );
};

// Review Detail Modal
const ReviewDetailModal = ({ 
  review, 
  onClose 
}: { 
  review: Review; 
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
        <div className="fixed inset-0 bg-black/40 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
            <h2 className="text-lg font-semibold text-gray-900">Review Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Rating & Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-6 h-6 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                  />
                ))}
                <span className="ml-2 text-lg font-bold text-gray-900">{review.rating}/5</span>
              </div>
              <div className="flex items-center gap-2">
                {review.isVerified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium border border-green-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified
                  </span>
                )}
                {!review.isPublic && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium border border-gray-200">
                    <EyeOff className="w-3.5 h-3.5" />
                    Hidden
                  </span>
                )}
                {review.isModerated && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium border border-purple-200">
                    <Shield className="w-3.5 h-3.5" />
                    Moderated
                  </span>
                )}
              </div>
            </div>

            {/* Client Info */}
            <Card className="!p-4">
              <p className="text-xs font-medium text-gray-500 mb-2">Reviewer</p>
              <div className="flex items-center gap-3">
                <Avatar name={review.clientName} size="lg" />
                <div>
                  <p className="font-semibold text-gray-900">{review.clientName}</p>
                  <p className="text-sm text-gray-600">{review.source}</p>
                </div>
              </div>
            </Card>

            {/* Astrologer Info */}
            {review.astrologerId && (
              <Card className="!p-4">
                <p className="text-xs font-medium text-gray-500 mb-2">Astrologer Reviewed</p>
                <div className="flex items-center gap-3">
                  <Avatar 
                    src={review.astrologerId.profilePicture}
                    name={review.astrologerId.name} 
                    size="lg" 
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{review.astrologerId.name}</p>
                    <p className="text-sm text-gray-600">{review.astrologerId.email}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Review Text */}
            <Card className="!p-4 bg-gray-50 border-gray-200">
              <p className="text-gray-800">{review.reviewText}</p>
            </Card>

            {/* Astrologer Reply */}
            {review.astrologerReply && (
              <Card className="!p-4 bg-indigo-50 border-indigo-200">
                <p className="text-xs font-medium text-indigo-600 mb-2 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  Astrologer Reply
                </p>
                <p className="text-gray-800">{review.astrologerReply}</p>
                {review.repliedAt && (
                  <p className="text-xs text-gray-500 mt-2">{formatDateTime(review.repliedAt)}</p>
                )}
              </Card>
            )}

            {/* Engagement */}
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5 text-gray-600">
                <ThumbsUp className="w-4 h-4" />
                {formatNumber(review.helpfulCount)} found helpful
              </span>
            </div>

            {/* Meta Info */}
            <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-gray-200">
              <div>
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Created
                </p>
                <p className="text-gray-900">{formatDateTime(review.createdAt)}</p>
              </div>
              {review.moderatedAt && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Moderated At</p>
                  <p className="text-gray-900">{formatDateTime(review.moderatedAt)}</p>
                </div>
              )}
            </div>

            <div className="text-xs text-gray-500">
              <p><span className="font-medium">ID:</span> {review._id}</p>
              {review.sessionId && (
                <p><span className="font-medium">Session:</span> {review.sessionId}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
