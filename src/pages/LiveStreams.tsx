import { useEffect, useState, useCallback } from 'react';
import { 
  Search, 
  Radio,
  Eye,
  Heart,
  Users,
  TrendingUp,
  Play,
  StopCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
  Calendar,
  Clock
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, Loader, EmptyState, Avatar } from '@/components/common';
import { liveStreamsApi } from '@/api';
import { LiveStream } from '@/types';
import { formatDateTime, formatNumber } from '@/utils/formatters';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export const LiveStreams = () => {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);

  const loadStreams = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      const params: any = { 
        page, 
        limit: pagination.limit,
        sortBy: 'createdAt', 
        sortOrder: 'desc' 
      };
      
      if (search) params.search = search;
      
      const response = await liveStreamsApi.getAll(params);
      
      setStreams(response.data || []);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err) {
      console.error('Failed to load live streams:', err);
    } finally {
      setIsLoading(false);
    }
  }, [search, pagination.limit]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      loadStreams(1);
    }, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  // Auto-refresh every 30 seconds for live streams
  useEffect(() => {
    const interval = setInterval(() => {
      loadStreams(pagination.page);
    }, 30000);
    return () => clearInterval(interval);
  }, [loadStreams, pagination.page]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      loadStreams(newPage);
    }
  };

  // Calculate stats
  const stats = {
    total: pagination.total,
    live: streams.filter(s => s.isLive).length,
    ended: streams.filter(s => !s.isLive).length,
    totalViews: streams.reduce((sum, s) => sum + s.totalViews, 0),
    totalLikes: streams.reduce((sum, s) => sum + s.likes, 0),
    peakViewers: Math.max(...streams.map(s => s.peakViewerCount), 0),
  };

  return (
    <MainLayout>
      <PageHeader
        title="Live Streams Monitoring"
        subtitle={`Monitor all live streams • ${pagination.total} total`}
      />

      {/* Stats Cards - Minimal Flat */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        <Card className="!p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-600">Total Streams</p>
            </div>
          </div>
        </Card>
        
        <Card className="!p-4 border-l-4 border-l-red-500">
          <div className="flex items-center gap-2">
            <Play className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.live}</p>
              <p className="text-xs text-gray-600">Live Now</p>
            </div>
          </div>
        </Card>
        
        <Card className="!p-4 border-l-4 border-l-gray-500">
          <div className="flex items-center gap-2">
            <StopCircle className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.ended}</p>
              <p className="text-xs text-gray-600">Ended</p>
            </div>
          </div>
        </Card>
        
        <Card className="!p-4 border-l-4 border-l-purple-500">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalViews)}</p>
              <p className="text-xs text-gray-600">Total Views</p>
            </div>
          </div>
        </Card>
        
        <Card className="!p-4 border-l-4 border-l-pink-500">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalLikes)}</p>
              <p className="text-xs text-gray-600">Total Likes</p>
            </div>
          </div>
        </Card>
        
        <Card className="!p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.peakViewers)}</p>
              <p className="text-xs text-gray-600">Peak Viewers</p>
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
              placeholder="Search by title, astrologer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            onClick={() => loadStreams(pagination.page)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 border border-gray-300 rounded-md transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Grid View */}
        {isLoading ? (
          <div className="py-12">
            <Loader size="lg" text="Loading streams..." />
          </div>
        ) : streams.length === 0 ? (
          <EmptyState
            icon={Radio}
            title="No live streams found"
            description="No live streams match your current filters"
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {streams.map((stream) => (
                <div
                  key={stream._id}
                  onClick={() => setSelectedStream(stream)}
                  className="cursor-pointer"
                >
                  <Card className="!p-0 overflow-hidden hover:shadow-md transition-shadow">
                    {/* Thumbnail */}
                    <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <Radio className="w-12 h-12 text-gray-400" />
                      {stream.isLive && (
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-red-600 text-white px-2.5 py-1 rounded-md text-xs font-medium">
                          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          LIVE
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">
                        {stream.title}
                      </h3>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Avatar
                          src={stream.astrologerId.profilePicture}
                          name={stream.astrologerId.name}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {stream.astrologerId.name}
                          </p>
                          <p className="text-xs text-gray-500">{stream.category}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {formatNumber(stream.isLive ? stream.viewerCount : stream.totalViews)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {formatNumber(stream.likes)}
                          </span>
                        </div>
                        {stream.isLive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 rounded-md font-medium border border-red-200">
                            <Users className="w-3 h-3" />
                            {stream.viewerCount}
                          </span>
                        ) : (
                          <span className="text-gray-500">Ended</span>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} streams
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
      {selectedStream && (
        <StreamDetailModal
          stream={selectedStream}
          onClose={() => setSelectedStream(null)}
        />
      )}
    </MainLayout>
  );
};

// Stream Detail Modal
const StreamDetailModal = ({ 
  stream, 
  onClose 
}: { 
  stream: LiveStream; 
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
        <div className="fixed inset-0 bg-black/40 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
            <h2 className="text-lg font-semibold text-gray-900">Stream Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Status */}
            <div className="flex items-center justify-between">
              {stream.isLive ? (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  LIVE NOW
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-md text-sm font-medium border border-gray-200">
                  <StopCircle className="w-4 h-4" />
                  Ended
                </span>
              )}
              <span className="text-sm text-gray-500">ID: {stream._id.slice(-8)}</span>
            </div>

            {/* Title & Description */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{stream.title}</h3>
              {stream.description && (
                <p className="text-gray-700">{stream.description}</p>
              )}
            </div>

            {/* Astrologer */}
            <Card className="!p-4">
              <p className="text-xs font-medium text-gray-500 mb-2">Hosted By</p>
              <div className="flex items-center gap-3">
                <Avatar 
                  src={stream.astrologerId.profilePicture}
                  name={stream.astrologerId.name} 
                  size="lg" 
                />
                <div>
                  <p className="font-semibold text-gray-900">{stream.astrologerId.name}</p>
                  <p className="text-sm text-gray-600">{stream.astrologerId.email}</p>
                  {stream.astrologerSpecialty && (
                    <p className="text-xs text-gray-500">{stream.astrologerSpecialty}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="!p-4 border-l-4 border-l-purple-500">
                <div className="flex items-center gap-2 text-purple-600 mb-1">
                  <Eye className="w-4 h-4" />
                  <span className="text-xs font-medium">Total Views</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stream.totalViews)}</p>
              </Card>
              
              <Card className="!p-4 border-l-4 border-l-pink-500">
                <div className="flex items-center gap-2 text-pink-600 mb-1">
                  <Heart className="w-4 h-4" />
                  <span className="text-xs font-medium">Likes</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stream.likes)}</p>
              </Card>
              
              <Card className="!p-4 border-l-4 border-l-blue-500">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-medium">Current Viewers</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stream.viewerCount)}</p>
              </Card>
              
              <Card className="!p-4 border-l-4 border-l-emerald-500">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-medium">Peak Viewers</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stream.peakViewerCount)}</p>
              </Card>
            </div>

            {/* Category & Tags */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Category</p>
              <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-md text-sm font-medium border border-indigo-200">
                {stream.category}
              </span>
            </div>

            {stream.tags && stream.tags.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {stream.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-gray-200">
              {stream.startedAt && (
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Started
                  </p>
                  <p className="text-gray-900">{formatDateTime(stream.startedAt)}</p>
                </div>
              )}
              {stream.endedAt && (
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Ended
                  </p>
                  <p className="text-gray-900">{formatDateTime(stream.endedAt)}</p>
                </div>
              )}
            </div>

            {/* Meta */}
            <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
              <p><span className="font-medium">Created:</span> {formatDateTime(stream.createdAt)}</p>
              <p><span className="font-medium">Channel:</span> {stream.agoraChannelName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
