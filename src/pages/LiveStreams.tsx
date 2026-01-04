import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Radio,
  Eye,
  Heart,
  Users,
  TrendingUp,
  Play,
  StopCircle,
  Ban,
  Info
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Card, EmptyState, RoundAvatar, PillBadge, ShowEntriesDropdown, StatCard, SearchBar, StatCardSkeleton } from '@/components/common';
import { SkeletonBox, SkeletonCard, SkeletonCircle } from '@/components/common/Skeleton';
import { LiveStreamViewer } from '@/components/liveStream/LiveStreamViewer';
import { StreamDetailModal } from '@/components/liveStream/StreamDetailModal';
import { LiveStreamStoryRounds } from '@/components/liveStream/LiveStreamStoryRounds';
import { formatNumber } from '@/utils/formatters';
import { RootState } from '@/store';
import { socketService } from '@/services/socketService';
import {
  fetchStreamsRequest,
  setFilter,
  setSearch,
  setEntriesPerPage,
  setCurrentPage,
  toggleSelection,
  selectAll,
  deselectAll,
  LiveStreamFilter,
  streamStarted,
  streamEnded,
  updateStreamStats,
} from '@/store/slices/liveStreamsSlice';
import { ROUTES } from '@/utils/constants';

export const LiveStreams = () => {
  const dispatch = useDispatch();
  const { 
    streams, 
    isLoading, 
    filter, 
    search, 
    entriesPerPage, 
    currentPage, 
    selectedIds, 
    stats 
  } = useSelector((state: RootState) => state.liveStreams);
  
  const [selectedStream, setSelectedStream] = useState<any | null>(null);
  const [detailStream, setDetailStream] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    dispatch(fetchStreamsRequest());

    // Socket.io listeners for the list
    const unregisterStart = socketService.onStreamStarted((stream) => {
      dispatch(streamStarted(stream));
    });

    const unregisterEnd = socketService.onStreamEnded((data) => {
      dispatch(streamEnded(data.streamId));
    });

    const unregisterLikes = socketService.onLiveLikeCount((data) => {
      dispatch(updateStreamStats({ streamId: data.streamId, likes: data.count }));
    });

    const unregisterViewers = socketService.onLiveViewerCount((data) => {
      dispatch(updateStreamStats({ streamId: data.streamId, viewerCount: data.count }));
    });

    return () => {
      unregisterStart();
      unregisterEnd();
      unregisterLikes();
      unregisterViewers();
    };
  }, [dispatch]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(fetchStreamsRequest());
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  // Client-side filtering
  const filteredStreams = streams.filter(s => {
    // Apply status filter
    if (filter === 'live' && !s.isLive) return false;
    if (filter === 'ended' && s.isLive) return false;
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        s.title?.toLowerCase().includes(searchLower) ||
        s.description?.toLowerCase().includes(searchLower) ||
        s.astrologerId?.name?.toLowerCase().includes(searchLower) ||
        s.category?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredStreams.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const paginatedStreams = filteredStreams.slice(startIndex, endIndex);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      dispatch(selectAll(paginatedStreams.map(s => s._id)));
    } else {
      dispatch(deselectAll());
    }
  };

  const handleSelectOne = (id: string) => {
    dispatch(toggleSelection(id));
  };

  const isAllSelected = paginatedStreams.length > 0 && paginatedStreams.every(s => selectedIds.includes(s._id));
  const isSomeSelected = paginatedStreams.some(s => selectedIds.includes(s._id)) && !isAllSelected;

  // Helper functions
  const getStatusBadge = (stream: any) => {
    if (stream.isLive) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-red-500 text-white shadow-sm">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          LIVE
        </span>
      );
    }
    return <PillBadge variant="inactive" label="Ended" showDot={false} />;
  };

  const formatDuration = (startedAt?: string, endedAt?: string) => {
    if (!startedAt) return '-';
    const start = new Date(startedAt).getTime();
    const end = endedAt ? new Date(endedAt).getTime() : Date.now();
    const minutes = Math.floor((end - start) / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-foreground">Live Streams</h1>
            <p className="text-gray-500 dark:text-muted-foreground mt-1">Monitor all live streams and replays</p>
          </div>
          
          {/* Search Bar */}
          <div className="w-full md:w-80">
            <SearchBar
              placeholder="Search streams, astrologers..."
              value={search}
              onSearch={(query) => dispatch(setSearch(query))}
              onClear={() => dispatch(setSearch(''))}
            />
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
              icon={Radio}
            />
            <StatCard
              title="Live Now"
              value={stats.live}
              icon={Play}
            />
            <StatCard
              title="Ended"
              value={stats.ended}
              icon={StopCircle}
            />
            <StatCard
              title="Total Views"
              value={formatNumber(stats.totalViews)}
              icon={Eye}
            />
            <StatCard
              title="Total Likes"
              value={formatNumber(stats.totalLikes)}
              icon={Heart}
            />
            <StatCard
              title="Peak Viewers"
              value={stats.peakViewers}
              icon={TrendingUp}
            />
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      {isLoading ? (
        <div className="mb-6 border-b border-gray-200 dark:border-border">
          <div className="flex gap-8 overflow-x-auto pb-3">
            {[1, 2, 3].map((i) => (
              <SkeletonBox key={i} width={100} height={20} radius={4} className="shimmer" />
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-6 border-b border-gray-200 dark:border-border">
          <div className="flex gap-8 overflow-x-auto">
            {[
              { key: 'all', label: 'All', count: stats.total },
              { key: 'live', label: 'Live Now', count: stats.live },
              { key: 'ended', label: 'Ended', count: stats.ended },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => dispatch(setFilter(key as LiveStreamFilter))}
                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  filter === key
                    ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-muted-foreground hover:text-gray-700 dark:hover:text-foreground hover:border-gray-300 dark:hover:border-border'
                }`}
              >
                {label}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  filter === key ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-muted text-gray-600 dark:text-muted-foreground'
                }`}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Instagram-Style Story Rounds for Currently Live Streams */}
      {!isLoading && streams.filter(s => s.isLive).length > 0 && (
        <Card className="mb-6">
          <LiveStreamStoryRounds
            streams={streams.filter(s => s.isLive)}
            onStreamClick={(stream) => setSelectedStream(stream)}
          />
        </Card>
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
              className="w-4 h-4 rounded border-gray-300 dark:border-border text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600 dark:text-muted-foreground">
              {selectedIds.length > 0 ? `${selectedIds.length} selected` : 'Select all'}
            </span>
            {selectedIds.length > 0 && (
              <button className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium">
                End Selected
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
                  <SkeletonCircle size={40} />
                  <div className="flex-1 space-y-2">
                    <SkeletonBox width={200} height={16} radius={4} />
                    <SkeletonBox width={150} height={14} radius={4} />
                  </div>
                  <SkeletonBox width={80} height={16} radius={4} />
                  <SkeletonBox width={60} height={16} radius={4} />
                  <SkeletonBox width={100} height={16} radius={4} />
                  <SkeletonBox width={80} height={32} radius={8} />
                </div>
              </SkeletonCard>
            ))}
          </div>
        ) : filteredStreams.length === 0 ? (
          <EmptyState
            icon={Radio}
            title="No live streams found"
            description="No streams match your current filters"
          />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-muted border-y border-gray-200 dark:border-border">
                  <tr>
                    <th className="w-12 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={input => {
                          if (input) input.indeterminate = isSomeSelected;
                        }}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-border text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-muted-foreground uppercase tracking-wider">Stream</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-muted-foreground uppercase tracking-wider">Astrologer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-muted-foreground uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-muted-foreground uppercase tracking-wider">Duration</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-muted-foreground uppercase tracking-wider">Viewers</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-muted-foreground uppercase tracking-wider">Engagement</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-border">
                  {paginatedStreams.map((stream) => (
                    <tr key={stream._id} className="hover:bg-gray-50 dark:hover:bg-muted transition-colors">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(stream._id)}
                          onChange={() => handleSelectOne(stream._id)}
                          className="w-4 h-4 rounded border-gray-300 dark:border-border text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="max-w-xs">
                          <p className="font-medium text-gray-900 dark:text-foreground truncate">{stream.title}</p>
                          {stream.description && (
                            <p className="text-xs text-gray-500 dark:text-muted-foreground truncate mt-1">{stream.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {stream.astrologerId ? (
                          <Link 
                            to={`${ROUTES.ASTROLOGERS}/${stream.astrologerId._id}`}
                            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                          >
                            <RoundAvatar
                              src={stream.astrologerId.profilePicture}
                              name={stream.astrologerId.name}
                              size="sm"
                            />
                            <span className="font-medium text-gray-900 dark:text-foreground hover:text-blue-600 dark:hover:text-blue-400">
                              {stream.astrologerId.name}
                            </span>
                          </Link>
                        ) : (
                          <span className="text-gray-400 dark:text-muted-foreground text-sm">Unknown</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-900 dark:text-foreground">{stream.category || '-'}</span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-foreground">
                        {formatDuration(stream.startedAt, stream.endedAt)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="w-4 h-4 text-gray-400 dark:text-muted-foreground" />
                          <span className="font-medium text-gray-900 dark:text-foreground">{stream.viewerCount || 0}</span>
                          <span className="text-gray-500 dark:text-muted-foreground text-xs">/ {stream.peakViewerCount || 0}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4 text-purple-500" />
                            <span className="text-gray-900 dark:text-foreground">{formatNumber(stream.totalViews)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4 text-pink-500" />
                            <span className="text-gray-900 dark:text-foreground">{formatNumber(stream.likes)}</span>
                          </div>
                    </div>
                      </td>
                      <td className="px-4 py-4">{getStatusBadge(stream)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setDetailStream(stream);
                              setShowDetailModal(true);
                            }}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="View Stream Details"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                          {stream.isLive && (
                            <>
                              <button
                                onClick={() => setSelectedStream(stream)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 dark:bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
                                title="Watch Live Stream"
                              >
                                <Play className="w-4 h-4" />
                                Watch
                              </button>
                              <button
                                className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="End Stream"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
                    </div>

            {/* Tablet View */}
            <div className="hidden md:block lg:hidden space-y-3">
              {paginatedStreams.map((stream) => (
                <div
                  key={stream._id}
                  className="flex items-center gap-4 p-4 border border-gray-200 dark:border-border rounded-lg hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-all"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(stream._id)}
                    onChange={() => handleSelectOne(stream._id)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-border text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold text-gray-900 dark:text-foreground truncate">{stream.title}</p>
                      {stream.astrologerId && (
                        <Link 
                          to={`${ROUTES.ASTROLOGERS}/${stream.astrologerId._id}`}
                          className="flex items-center gap-2 hover:opacity-80"
                        >
                          <RoundAvatar
                            src={stream.astrologerId.profilePicture}
                            name={stream.astrologerId.name}
                            size="sm"
                          />
                          <span className="text-sm text-gray-600 dark:text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400">
                            {stream.astrologerId.name}
                          </span>
                        </Link>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="text-gray-600 dark:text-muted-foreground">{formatDuration(stream.startedAt, stream.endedAt)}</span>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-purple-500" />
                        <span className="dark:text-foreground">{formatNumber(stream.totalViews)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-pink-500" />
                        <span className="dark:text-foreground">{formatNumber(stream.likes)}</span>
                      </div>
                      {getStatusBadge(stream)}
                      <button
                        onClick={() => {
                          setDetailStream(stream);
                          setShowDetailModal(true);
                        }}
                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      {stream.isLive && (
                        <button
                          onClick={() => setSelectedStream(stream)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 dark:bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
                        >
                          <Play className="w-4 h-4" />
                          Watch
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
              {paginatedStreams.map((stream) => (
                <div
                  key={stream._id}
                  className="border border-gray-200 dark:border-border rounded-xl p-4 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-sm transition-all bg-white dark:bg-card"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(stream._id)}
                      onChange={() => handleSelectOne(stream._id)}
                      className="w-4 h-4 mt-1 rounded border-gray-300 dark:border-border text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-900 dark:text-foreground">{stream.title}</p>
                        {getStatusBadge(stream)}
                </div>

                      {stream.description && (
                        <p className="text-sm text-gray-500 dark:text-muted-foreground mb-3 line-clamp-2">{stream.description}</p>
                      )}
                      
                      {stream.astrologerId && (
                        <Link 
                          to={`${ROUTES.ASTROLOGERS}/${stream.astrologerId._id}`}
                          className="flex items-center gap-2 mb-3 hover:opacity-80"
                        >
                          <RoundAvatar
                      src={stream.astrologerId.profilePicture}
                      name={stream.astrologerId.name}
                      size="sm"
                    />
                    <div>
                            <p className="text-xs text-gray-500 dark:text-muted-foreground">Hosted by</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-foreground hover:text-blue-600 dark:hover:text-blue-400">
                              {stream.astrologerId.name}
                            </p>
                          </div>
                        </Link>
                      )}
                      
                      <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                        <div>
                          <p className="text-gray-500 dark:text-muted-foreground text-xs mb-1">Duration</p>
                          <p className="font-medium text-gray-900 dark:text-foreground">
                            {formatDuration(stream.startedAt, stream.endedAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-muted-foreground text-xs mb-1">Views</p>
                          <div className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5 text-purple-500" />
                            <span className="font-medium text-gray-900 dark:text-foreground">{formatNumber(stream.totalViews)}</span>
                    </div>
                  </div>
                        <div>
                          <p className="text-gray-500 dark:text-muted-foreground text-xs mb-1">Likes</p>
                          <div className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5 text-pink-500" />
                            <span className="font-medium text-gray-900 dark:text-foreground">{formatNumber(stream.likes)}</span>
                          </div>
                    </div>
                  </div>

                      {stream.isLive && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setDetailStream(stream);
                              setShowDetailModal(true);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm border border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 font-medium rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          >
                            <Info className="w-4 h-4" />
                            Details
                          </button>
                          <button
                            onClick={() => setSelectedStream(stream)}
                            className="flex-[2] flex items-center justify-center gap-2 px-3 py-2 text-sm bg-red-500 dark:bg-red-600 text-white font-medium rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
                          >
                            <Play className="w-4 h-4" />
                            Watch Live
                          </button>
                          <button className="px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                            <Ban className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      {!stream.isLive && (
                        <button
                          onClick={() => {
                            setDetailStream(stream);
                            setShowDetailModal(true);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm border border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 font-medium rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          <Info className="w-4 h-4" />
                          View Stream Analytics
                        </button>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-border">
                <p className="text-sm text-gray-600 dark:text-muted-foreground">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredStreams.length)} of {filteredStreams.length} streams
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => dispatch(setCurrentPage(currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-sm border border-gray-300 dark:border-border rounded-lg hover:bg-gray-50 dark:hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-foreground"
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
                              ? 'bg-blue-600 dark:bg-primary-600 text-white'
                              : 'text-gray-700 dark:text-foreground hover:bg-gray-100 dark:hover:bg-muted'
                          }`}
                        >
                          {page}
                        </button>
                      ) : (
                        <span key={idx} className="px-2 text-gray-400 dark:text-muted-foreground">
                          {page}
                        </span>
                      )
                    )}
                  </div>
                  <button
                    onClick={() => dispatch(setCurrentPage(currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-sm border border-gray-300 dark:border-border rounded-lg hover:bg-gray-50 dark:hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-foreground"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Live Stream Viewer Modal */}
      {selectedStream && (
        <LiveStreamViewer
          stream={selectedStream}
          onClose={() => setSelectedStream(null)}
          onEndStream={() => {
            setSelectedStream(null);
            dispatch(fetchStreamsRequest());
          }}
        />
      )}

      {/* Stream Detail & Analytics Modal */}
      {detailStream && (
        <StreamDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setDetailStream(null);
          }}
          stream={detailStream}
        />
      )}
    </MainLayout>
  );
};




