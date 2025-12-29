import { useState, useEffect } from 'react';
import { Star, X } from 'lucide-react';
import { Modal } from '@/components/common';
import { Avatar } from '@/components/common';
import { astrologersApi } from '@/api';
import { reviewsApi } from '@/api';
import { Review, CreateReviewRequest, UpdateReviewRequest } from '@/types';
import { useToastContext } from '@/contexts/ToastContext';

type AstrologerLite = {
  _id: string;
  name: string;
  email?: string;
  profilePicture?: string;
};

interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  astrologerId?: string; // Pre-fill astrologer if provided
  review?: Review; // If provided, edit mode
}

export const ReviewFormModal = ({
  isOpen,
  onClose,
  onSuccess,
  astrologerId: initialAstrologerId,
  review
}: ReviewFormModalProps) => {
  const toast = useToastContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [astrologers, setAstrologers] = useState<AstrologerLite[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAstrologerDropdown, setShowAstrologerDropdown] = useState(false);
  const [selectedAstrologerId, setSelectedAstrologerId] = useState<string>(initialAstrologerId || '');
  const [selectedAstrologer, setSelectedAstrologer] = useState<AstrologerLite | null>(null);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerAvatar, setReviewerAvatar] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState('');
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('');

  // Load astrologers for dropdown
  useEffect(() => {
    if (isOpen && !review) {
      loadAstrologers();
    }
  }, [isOpen, searchQuery]);

  // Pre-fill form if editing
  useEffect(() => {
    if (review) {
      setSelectedAstrologerId(review.astrologerId?._id || '');
      setSelectedAstrologer(review.astrologerId ? {
        _id: review.astrologerId._id,
        name: review.astrologerId.name,
        email: review.astrologerId.email,
        profilePicture: review.astrologerId.profilePicture
      } : null);
      setReviewerName(review.customReviewerName || review.clientName || '');
      setReviewerAvatar(review.customReviewerAvatar || review.clientAvatar || '');
      setRating(review.rating);
      setReviewText(review.reviewText);
      if (review.customCreatedAt) {
        const date = new Date(review.customCreatedAt);
        setCustomDate(date.toISOString().split('T')[0]);
        setCustomTime(date.toTimeString().slice(0, 5));
      } else {
        setCustomDate('');
        setCustomTime('');
      }
    } else {
      // Reset form for new review
      setSelectedAstrologerId(initialAstrologerId || '');
      setSelectedAstrologer(null);
      setReviewerName('');
      setReviewerAvatar('');
      setRating(0);
      setReviewText('');
      setCustomDate('');
      setCustomTime('');
    }
  }, [review, initialAstrologerId, isOpen]);

  // Load selected astrologer details
  useEffect(() => {
    if (selectedAstrologerId && !selectedAstrologer) {
      loadAstrologerDetails(selectedAstrologerId);
    }
  }, [selectedAstrologerId]);

  const loadAstrologers = async () => {
    try {
      const response = await astrologersApi.getAll({
        search: searchQuery,
        page: 1,
        limit: 20
      });
      const data = (response.data || []).map((a: any) => ({
        _id: a._id,
        name: a.name,
        email: a.email,
        profilePicture: a.profilePicture
      })) as AstrologerLite[];
      setAstrologers(data);
    } catch (error) {
      console.error('Failed to load astrologers:', error);
    }
  };

  const loadAstrologerDetails = async (id: string) => {
    try {
      const response = await astrologersApi.getById(id);
      if (response.data) {
        setSelectedAstrologer({
          _id: response.data._id,
          name: response.data.name,
          email: (response.data as any).email,
          profilePicture: (response.data as any).profilePicture
        });
      }
    } catch (error) {
      console.error('Failed to load astrologer details:', error);
    }
  };

  const filteredAstrologers = astrologers.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectAstrologer = (astrologer: AstrologerLite) => {
    setSelectedAstrologerId(astrologer._id);
    setSelectedAstrologer(astrologer);
    setShowAstrologerDropdown(false);
    setSearchQuery('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!selectedAstrologerId) {
      toast.error('Please select an astrologer');
      return;
    }

    if (!reviewerName.trim()) {
      toast.error('Reviewer name is required');
      return;
    }

    if (reviewerName.length > 100) {
      toast.error('Reviewer name cannot exceed 100 characters');
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!reviewText.trim()) {
      toast.error('Review text is required');
      return;
    }

    if (reviewText.trim().length < 10) {
      toast.error('Review text must be at least 10 characters');
      return;
    }

    if (reviewText.length > 1000) {
      toast.error('Review text cannot exceed 1000 characters');
      return;
    }

    // Validate custom date if provided
    let customCreatedAt: string | undefined;
    if (customDate) {
      if (!customTime) {
        toast.error('Please provide both date and time');
        return;
      }
      const dateTime = new Date(`${customDate}T${customTime}`);
      if (isNaN(dateTime.getTime())) {
        toast.error('Invalid date or time');
        return;
      }
      if (dateTime > new Date()) {
        toast.error('Custom date cannot be in the future');
        return;
      }
      customCreatedAt = dateTime.toISOString();
    }

    setIsSubmitting(true);

    try {
      if (review) {
        // Update existing review
        const updateData: UpdateReviewRequest = {
          rating,
          reviewText: reviewText.trim(),
          customReviewerName: reviewerName.trim(),
          customReviewerAvatar: reviewerAvatar.trim() || undefined,
          customCreatedAt
        };
        await reviewsApi.update(review._id, updateData);
        toast.success('Review updated successfully');
      } else {
        // Create new review
        const createData: CreateReviewRequest = {
          astrologerId: selectedAstrologerId,
          rating,
          reviewText: reviewText.trim(),
          customReviewerName: reviewerName.trim(),
          customReviewerAvatar: reviewerAvatar.trim() || undefined,
          customCreatedAt
        };
        await reviewsApi.create(createData);
        toast.success('Review created successfully');
      }

      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Failed to save review:', error);
      toast.error(error?.response?.data?.message || 'Failed to save review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setShowAstrologerDropdown(false);
      setSearchQuery('');
      onClose();
    }
  };

  const isValidUrl = (url: string) => {
    if (!url.trim()) return true; // Empty is valid (optional)
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={review ? 'Edit Review' : 'Add Review'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Astrologer Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Astrologer <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={selectedAstrologer ? selectedAstrologer.name : searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowAstrologerDropdown(true);
                if (!e.target.value) {
                  setSelectedAstrologerId('');
                  setSelectedAstrologer(null);
                }
              }}
              onFocus={() => {
                if (!selectedAstrologer) {
                  setShowAstrologerDropdown(true);
                }
              }}
              placeholder="Search astrologer by name or email..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={!!review || !!initialAstrologerId}
            />
            {selectedAstrologer && (
              <button
                type="button"
                onClick={() => {
                  setSelectedAstrologerId('');
                  setSelectedAstrologer(null);
                  setSearchQuery('');
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                disabled={!!review || !!initialAstrologerId}
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
            {showAstrologerDropdown && !selectedAstrologer && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredAstrologers.length > 0 ? (
                  filteredAstrologers.map((astrologer) => (
                    <button
                      key={astrologer._id}
                      type="button"
                      onClick={() => handleSelectAstrologer(astrologer)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3"
                    >
                      <Avatar
                        src={astrologer.profilePicture}
                        name={astrologer.name}
                        size="sm"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{astrologer.name}</p>
                        <p className="text-sm text-gray-500">{astrologer.email}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500">No astrologers found</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Reviewer Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reviewer Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
            placeholder="Enter reviewer name"
            maxLength={100}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          />
          <p className="mt-1 text-xs text-gray-500">{reviewerName.length}/100 characters</p>
        </div>

        {/* Reviewer Avatar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reviewer Avatar URL
          </label>
          <div className="flex gap-3">
            <input
              type="url"
              value={reviewerAvatar}
              onChange={(e) => setReviewerAvatar(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <div className="flex-shrink-0">
              <Avatar
                src={reviewerAvatar || undefined}
                name={reviewerName || 'R'}
                size="md"
              />
            </div>
          </div>
          {reviewerAvatar && !isValidUrl(reviewerAvatar) && (
            <p className="mt-1 text-xs text-red-500">Invalid URL format</p>
          )}
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoveredRating || rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm text-gray-600">{rating} out of 5</span>
            )}
          </div>
        </div>

        {/* Review Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Review Text <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Write your review here..."
            rows={5}
            maxLength={1000}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            {reviewText.length}/1000 characters (minimum 10)
          </p>
        </div>

        {/* Custom Date/Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Date & Time (Optional)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <input
                type="time"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                disabled={!customDate}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Leave empty to use current date/time
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || rating === 0 || !reviewText.trim() || !reviewerName.trim() || !selectedAstrologerId}
            className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : review ? 'Update Review' : 'Create Review'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

