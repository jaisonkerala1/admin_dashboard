import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Star,
  MessageSquare,
  Eye,
  EyeOff,
  CheckCircle2,
  Shield,
  Trash2,
  ThumbsUp
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Card, Loader, EmptyState, RoundAvatar, PillBadge, ShowEntriesDropdown, StatCard } from '@/components/common';
import { formatDateTime } from '@/utils/formatters';
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
  const { 
    reviews, 
    isLoading, 
    filter, 
    search, 
    entriesPerPage, 
    currentPage, 
    selectedIds, 
    stats 
  } = useSelector((state: RootState) => state.reviews);

  useEffect(() => {
    dispatch(fetchReviewsRequest());
  }, [dispatch]);

  // Client-side filtering
  const filteredReviews = reviews.filter(r => {
    // Apply status filter
    if (filter === 'verified' && !r.isVerified) return false;
    if (filter === 'unverified' && r.isVerified) return false;
    if (filter === 'public' && !r.isPublic) return false;
    if (filter === 'hidden' && r.isPublic) return false;
    if (filter === '5stars' && r.rating !== 5) return false;
    if (filter === '4stars' && r.rating !== 4) return false;
    if (filter === '3stars' && r.rating !== 3) return false;
    if (filter === '2stars' && r.rating !== 2) return false;
    if (filter === '1star' && r.rating !== 1) return false;
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        r.clientName?.toLowerCase().includes(searchLower) ||
        r.reviewText?.toLowerCase().includes(searchLower) ||
        r.astrologerId?.name?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredReviews.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const paginatedReviews = filteredReviews.slice(startIndex, endIndex);

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

  const isAllSelected = paginatedReviews.length > 0 && paginatedReviews.every(r => selectedIds.has(r._id));
  const isSomeSelected = paginatedReviews.some(r => selectedIds.has(r._id)) && !isAllSelected;

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
          
          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews, clients..."
              value={search}
              onChange={(e) => dispatch(setSearch(e.target.value))}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            title="Total"
            value={stats.total}
            icon={MessageSquare}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title="Avg Rating"
            value={stats.averageRating.toFixed(1)}
            icon={Star}
            iconColor="text-amber-600"
            iconBgColor="bg-amber-100"
          />
          <StatCard
            title="Verified"
            value={stats.verified}
            icon={CheckCircle2}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <StatCard
            title="Public"
            value={stats.public}
            icon={Eye}
            iconColor="text-indigo-600"
            iconBgColor="bg-indigo-100"
          />
          <StatCard
            title="Moderated"
            value={stats.moderated}
            icon={Shield}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
          />
          <StatCard
            title="5 Stars"
            value={stats.rating5}
            icon={Star}
            iconColor="text-yellow-600"
            iconBgColor="bg-yellow-100"
            />
          </div>
        </div>

      {/* Filter Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-8 overflow-x-auto">
          {[
            { key: 'all', label: 'All', count: stats.total },
            { key: 'verified', label: 'Verified', count: stats.verified },
            { key: 'unverified', label: 'Unverified', count: stats.unverified },
            { key: 'public', label: 'Public', count: stats.public },
            { key: 'hidden', label: 'Hidden', count: stats.hidden },
            { key: '5stars', label: '5 Stars', count: stats.rating5 },
            { key: '4stars', label: '4 Stars', count: stats.rating4 },
            { key: '3stars', label: '3 Stars', count: stats.rating3 },
            { key: '2stars', label: '2 Stars', count: stats.rating2 },
            { key: '1star', label: '1 Star', count: stats.rating1 },
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
              {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select all'}
            </span>
            {selectedIds.size > 0 && (
              <button className="text-sm text-red-600 hover:text-red-700 font-medium">
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
          <div className="py-12">
            <Loader size="lg" text="Loading reviews..." />
          </div>
        ) : filteredReviews.length === 0 ? (
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
                          checked={selectedIds.has(review._id)}
                          onChange={() => handleSelectOne(review._id)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-gray-900">{review.clientName}</p>
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
                        {formatDateTime(review.createdAt)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {review.isVerified && <PillBadge variant="approved" label="Verified" showDot={false} />}
                          {review.isPublic ? (
                            <PillBadge variant="active" label="Public" showDot={false} />
                          ) : (
                            <PillBadge variant="inactive" label="Hidden" showDot={false} />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
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
                  className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(review._id)}
                      onChange={() => handleSelectOne(review._id)}
                      className="w-4 h-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                    <div>
                          <p className="font-semibold text-gray-900">{review.clientName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getRatingStars(review.rating)}
                            <span className="text-sm font-medium text-gray-700">{review.rating}</span>
                    </div>
                  </div>
                        <div className="flex gap-1">
                          {review.isVerified && <PillBadge variant="approved" label="✓" showDot={false} />}
                          {review.isPublic ? (
                            <Eye className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          )}
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
                            <p className="text-sm font-medium text-gray-900 hover:text-blue-600">
                              {review.astrologerId.name}
                            </p>
                  </div>
                        </Link>
                      )}
                      
                      <p className="text-sm text-gray-700 mb-3 line-clamp-3">{review.reviewText}</p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{formatDateTime(review.createdAt)}</span>
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
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredReviews.length)} of {filteredReviews.length} reviews
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
    </MainLayout>
  );
};
