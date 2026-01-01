import { useState } from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';
import { Modal } from '@/components/common';
import { Review } from '@/types';
import { reviewsApi } from '@/api';
import { formatDateTime } from '@/utils/formatters';
import { useToastContext } from '@/contexts/ToastContext';

interface ReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  review: Review;
}

export const ReplyModal = ({ isOpen, onClose, onSuccess, review }: ReplyModalProps) => {
  const toast = useToastContext();
  const [replyText, setReplyText] = useState(review.astrologerReply || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const hasReply = !!review.astrologerReply;

  const handleSubmit = async () => {
    if (!replyText.trim()) {
      toast.error('Reply text is required');
      return;
    }

    if (replyText.length > 500) {
      toast.error('Reply cannot exceed 500 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      await reviewsApi.replyToReview(review._id, replyText.trim());
      toast.success(hasReply ? 'Reply updated successfully' : 'Reply submitted successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to submit reply:', error);
      toast.error(error?.response?.data?.message || 'Failed to submit reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await reviewsApi.deleteReply(review._id);
      toast.success('Reply deleted successfully');
      setShowDeleteConfirm(false);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to delete reply:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !showDeleteConfirm}
        onClose={() => !isSubmitting && onClose()}
        title={hasReply ? 'Edit Reply' : 'Reply to Review'}
        size="lg"
      >
        <div className="space-y-4">
          {/* Review Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-medium text-gray-900">{review.clientName}</p>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-600">{review.reviewText}</p>
            <p className="text-xs text-gray-500">
              {formatDateTime(review.customCreatedAt || review.createdAt)}
            </p>
          </div>

          {/* Existing Reply (if editing) */}
          {hasReply && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 mb-1">Current Reply</p>
                  <p className="text-sm text-blue-800">{review.astrologerReply}</p>
                  {review.repliedAt && (
                    <p className="text-xs text-blue-600 mt-1">{formatDateTime(review.repliedAt)}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Reply Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {hasReply ? 'Update Reply' : 'Your Reply'}
            </label>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={4}
              maxLength={500}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">{replyText.length}/500 characters</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            {hasReply && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isSubmitting}
                className="px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4 inline mr-2" />
                Delete Reply
              </button>
            )}
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !replyText.trim()}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : hasReply ? 'Update Reply' : 'Submit Reply'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => !isSubmitting && setShowDeleteConfirm(false)}
        title="Delete Reply"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this reply? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isSubmitting}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Deleting...' : 'Delete Reply'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

