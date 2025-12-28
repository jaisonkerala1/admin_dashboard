import { useEffect, useState, useCallback } from 'react';
import { 
  MessageSquare,
  Heart,
  Eye,
  Share2,
  Pin,
  Shield,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
  Calendar,
  Tag
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, Loader, EmptyState, Avatar, SearchBar, StatCard } from '@/components/common';
import { discussionsApi } from '@/api';
import { Discussion } from '@/types';
import { formatDateTime, formatNumber } from '@/utils/formatters';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export const Discussions = () => {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);

  const loadDiscussions = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      const params: any = { 
        page, 
        limit: pagination.limit,
        sortBy: 'createdAt', 
        sortOrder: 'desc' 
      };
      
      if (search) params.search = search;
      
      const response = await discussionsApi.getAll(params);
      
      setDiscussions(response.data || []);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err) {
      console.error('Failed to load discussions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [search, pagination.limit]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      loadDiscussions(1);
    }, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      loadDiscussions(newPage);
    }
  };

  // Calculate stats - only from current page data
  const stats = {
    total: pagination.total,
    public: discussions.filter(d => d.isPublic).length,
    moderated: discussions.filter(d => d.isModerated).length,
    pinned: discussions.filter(d => d.isPinned).length,
    totalLikes: discussions.reduce((sum, d) => sum + d.likeCount, 0),
  };

  return (
    <MainLayout>
      <PageHeader
        title="Discussions Management"
        subtitle={`Manage all community discussions • ${pagination.total} total`}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <StatCard
          title="Total"
          value={stats.total}
          icon={MessageSquare}
        />
        <StatCard
          title="Public"
          value={stats.public}
          icon={Eye}
        />
        <StatCard
          title="Moderated"
          value={stats.moderated}
          icon={Shield}
        />
        <StatCard
          title="Pinned"
          value={stats.pinned}
          icon={Pin}
        />
        <StatCard
          title="Likes"
          value={formatNumber(stats.totalLikes)}
          icon={Heart}
        />
      </div>

      <Card>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="flex-1">
            <SearchBar
              placeholder="Search discussions by title or content..."
              value={search}
              onSearch={(query) => {
                setSearch(query);
              }}
              onClear={() => {
                setSearch('');
              }}
              debounceMs={300}
            />
          </div>
          <button
            onClick={() => loadDiscussions(pagination.page)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 border border-gray-300 rounded-md transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Discussions List */}
        {isLoading ? (
          <div className="py-12">
            <Loader size="lg" text="Loading discussions..." />
          </div>
        ) : discussions.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No discussions found"
            description="No discussions match your current filters"
          />
        ) : (
          <>
            <div className="space-y-4">
              {discussions.map((discussion) => (
                <div
                  key={discussion._id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-indigo-200 transition-colors cursor-pointer"
                  onClick={() => setSelectedDiscussion(discussion)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar 
                        src={discussion.authorPhoto || undefined} 
                        name={discussion.authorName} 
                        size="md" 
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900">{discussion.authorName}</p>
                          {discussion.isPinned && (
                            <Pin className="w-4 h-4 text-amber-600" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{formatDateTime(discussion.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                        {discussion.category}
                      </span>
                      <div className="flex items-center gap-2">
                        {!discussion.isPublic && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-xs font-medium border border-gray-200">
                            Hidden
                          </span>
                        )}
                        {discussion.isModerated && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md text-xs font-medium border border-purple-200">
                            <Shield className="w-3 h-3" />
                            Moderated
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2">{discussion.title}</h3>
                  <p className="text-gray-700 mb-3 line-clamp-2">{discussion.content}</p>
                  
                  {discussion.tags && discussion.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {discussion.tags.slice(0, 3).map((tag, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs font-medium"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                      {discussion.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{discussion.tags.length - 3} more</span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {formatNumber(discussion.likeCount)} likes
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {formatNumber(discussion.commentCount)} comments
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {formatNumber(discussion.viewCount)} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 className="w-3 h-3" />
                      {formatNumber(discussion.shareCount)} shares
                    </span>
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
                  {pagination.total} discussions
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
      {selectedDiscussion && (
        <DiscussionDetailModal
          discussion={selectedDiscussion}
          onClose={() => setSelectedDiscussion(null)}
        />
      )}
    </MainLayout>
  );
};

// Discussion Detail Modal
const DiscussionDetailModal = ({ 
  discussion, 
  onClose 
}: { 
  discussion: Discussion; 
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
        <div className="fixed inset-0 bg-black/40 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
            <h2 className="text-lg font-semibold text-gray-900">Discussion Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Status Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm font-medium">
                {discussion.category}
              </span>
              {discussion.isPinned && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-medium border border-amber-200">
                  <Pin className="w-3.5 h-3.5" />
                  Pinned
                </span>
              )}
              {!discussion.isPublic && (
                <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium border border-gray-200">
                  Hidden
                </span>
              )}
              {discussion.isModerated && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium border border-purple-200">
                  <Shield className="w-3.5 h-3.5" />
                  Moderated
                </span>
              )}
            </div>

            {/* Author */}
            <Card className="!p-4">
              <p className="text-xs font-medium text-gray-500 mb-2">Posted By</p>
              <div className="flex items-center gap-3">
                <Avatar 
                  src={discussion.authorPhoto || undefined}
                  name={discussion.authorName} 
                  size="lg" 
                />
                <div>
                  <p className="font-semibold text-gray-900">{discussion.authorName}</p>
                  <p className="text-sm text-gray-600">{formatDateTime(discussion.createdAt)}</p>
                </div>
              </div>
            </Card>

            {/* Title & Content */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{discussion.title}</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{discussion.content}</p>
            </div>

            {/* Tags */}
            {discussion.tags && discussion.tags.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {discussion.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="!p-4 border-l-4 border-l-pink-500">
                <div className="flex items-center gap-2 text-pink-600 mb-1">
                  <Heart className="w-4 h-4" />
                  <span className="text-xs font-medium">Likes</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(discussion.likeCount)}</p>
              </Card>
              
              <Card className="!p-4 border-l-4 border-l-indigo-500">
                <div className="flex items-center gap-2 text-indigo-600 mb-1">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-xs font-medium">Comments</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(discussion.commentCount)}</p>
              </Card>
              
              <Card className="!p-4 border-l-4 border-l-emerald-500">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <Eye className="w-4 h-4" />
                  <span className="text-xs font-medium">Views</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(discussion.viewCount)}</p>
              </Card>
              
              <Card className="!p-4 border-l-4 border-l-blue-500">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <Share2 className="w-4 h-4" />
                  <span className="text-xs font-medium">Shares</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(discussion.shareCount)}</p>
              </Card>
            </div>

            {/* Trending Score */}
            <Card className="!p-4 bg-amber-50 border-amber-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">Trending Score</span>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {discussion.trendingScore.toFixed(2)}
                </span>
              </div>
            </Card>

            {/* Meta Info */}
            <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-gray-200">
              <div>
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Last Activity
                </p>
                <p className="text-gray-900">{formatDateTime(discussion.lastActivityAt)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Visibility</p>
                <p className="text-gray-900 capitalize">{discussion.visibleTo}</p>
              </div>
            </div>

            <div className="text-xs text-gray-500">
              <p><span className="font-medium">ID:</span> {discussion._id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
