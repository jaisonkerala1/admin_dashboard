import { useEffect, useState } from 'react';
import { Search, Trash2, EyeOff, Eye } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, Loader, EmptyState, Avatar, Modal } from '@/components/common';
import { reviewsApi } from '@/api';
import { Review } from '@/types';
import { formatDateTime } from '@/utils/formatters';

export const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showModerateModal, setShowModerateModal] = useState(false);
  const [hideReason, setHideReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [search]);

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      const response = await reviewsApi.getAll({ search, sortBy: 'createdAt', sortOrder: 'desc' });
      setReviews(response.data?.data || []);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModerate = async (hide: boolean) => {
    if (!selectedReview || (hide && !hideReason.trim())) return;
    try {
      setIsProcessing(true);
      await reviewsApi.moderate(selectedReview._id, {
        isHidden: hide,
        hiddenReason: hide ? hideReason : undefined,
      });
      setShowModerateModal(false);
      setHideReason('');
      setSelectedReview(null);
      await loadReviews();
    } catch (err) {
      console.error('Failed to moderate review:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await reviewsApi.delete(id);
      await loadReviews();
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="Reviews Moderation"
        subtitle="Moderate and manage all reviews"
      />

      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-12">
            <Loader size="lg" text="Loading reviews..." />
          </div>
        ) : reviews.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No reviews found"
            description="No reviews match your search"
          />
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review._id}
                className={`p-4 rounded-lg border ${
                  review.isHidden ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={review.userId.profilePicture} name={review.userId.name} />
                    <div>
                      <p className="font-medium text-gray-900">{review.userId.name}</p>
                      <p className="text-sm text-gray-500">
                        Reviewed {review.astrologerId.name} • {formatDateTime(review.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-yellow-500">{'⭐'.repeat(review.rating)}</div>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-3">{review.comment}</p>
                
                {review.isHidden && review.hiddenReason && (
                  <div className="mb-3 p-2 bg-red-100 border border-red-200 rounded text-sm text-red-800">
                    <strong>Hidden reason:</strong> {review.hiddenReason}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  {review.isHidden ? (
                    <button
                      onClick={() => {
                        setSelectedReview(review);
                        handleModerate(false);
                      }}
                      className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      Show Review
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedReview(review);
                        setShowModerateModal(true);
                      }}
                      className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
                    >
                      <EyeOff className="w-4 h-4" />
                      Hide Review
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={showModerateModal}
        onClose={() => {
          setShowModerateModal(false);
          setSelectedReview(null);
          setHideReason('');
        }}
        title="Hide Review"
      >
        {selectedReview && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Please provide a reason for hiding this review:
            </p>
            <textarea
              value={hideReason}
              onChange={(e) => setHideReason(e.target.value)}
              className="input min-h-[120px] resize-none"
              placeholder="Enter reason for hiding..."
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowModerateModal(false)}
                className="btn btn-secondary btn-md"
              >
                Cancel
              </button>
              <button
                onClick={() => handleModerate(true)}
                disabled={!hideReason.trim() || isProcessing}
                className="btn btn-danger btn-md"
              >
                {isProcessing ? 'Hiding...' : 'Hide Review'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </MainLayout>
  );
};

