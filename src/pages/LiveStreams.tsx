import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Radio,
  Eye,
  Heart,
  Users,
  TrendingUp,
  Play,
  StopCircle,
  Ban
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Card, Loader, EmptyState, RoundAvatar, PillBadge, ShowEntriesDropdown, StatCard } from '@/components/common';
import { formatNumber } from '@/utils/formatters';
import { RootState } from '@/store';
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

  useEffect(() => {
    dispatch(fetchStreamsRequest());
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

  const isAllSelected = paginatedStreams.length > 0 && paginatedStreams.every(s => selectedIds.has(s._id));
  const isSomeSelected = paginatedStreams.some(s => selectedIds.has(s._id)) && !isAllSelected;

  // Helper functions
  const getStatusBadge = (stream: any) => {
    if (stream.isLive) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
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
            <h1 className="text-3xl font-bold text-gray-900">Live Streams</h1>
            <p className="text-gray-500 mt-1">Monitor all live streams and replays</p>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search streams, astrologers..."
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
            icon={Radio}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title="Live Now"
            value={stats.live}
            icon={Play}
            iconColor="text-red-600"
            iconBgColor="bg-red-100"
          />
          <StatCard
            title="Ended"
            value={stats.ended}
            icon={StopCircle}
            iconColor="text-gray-600"
            iconBgColor="bg-gray-100"
          />
          <StatCard
            title="Total Views"
            value={formatNumber(stats.totalViews)}
            icon={Eye}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
          />
          <StatCard
            title="Total Likes"
            value={formatNumber(stats.totalLikes)}
            icon={Heart}
            iconColor="text-pink-600"
            iconBgColor="bg-pink-100"
          />
          <StatCard
            title="Peak Viewers"
            value={stats.peakViewers}
            icon={TrendingUp}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-100"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 border-b border-gray-200">
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
          <div className="py-12">
            <Loader size="lg" text="Loading live streams..." />
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
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stream</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Astrologer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Duration</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Viewers</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Engagement</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedStreams.map((stream) => (
                    <tr key={stream._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(stream._id)}
                          onChange={() => handleSelectOne(stream._id)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="max-w-xs">
                          <p className="font-medium text-gray-900 truncate">{stream.title}</p>
                          {stream.description && (
                            <p className="text-xs text-gray-500 truncate mt-1">{stream.description}</p>
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
                            <span className="font-medium text-gray-900 hover:text-blue-600">
                              {stream.astrologerId.name}
                            </span>
                          </Link>
                        ) : (
                          <span className="text-gray-400 text-sm">Unknown</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-900">{stream.category || '-'}</span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {formatDuration(stream.startedAt, stream.endedAt)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{stream.viewerCount || 0}</span>
                          <span className="text-gray-500 text-xs">/ {stream.peakViewerCount || 0}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4 text-purple-500" />
                            <span className="text-gray-900">{formatNumber(stream.totalViews)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4 text-pink-500" />
                            <span className="text-gray-900">{formatNumber(stream.likes)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">{getStatusBadge(stream)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {stream.isLive && (
                            <button
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="End Stream"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
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
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-all"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(stream._id)}
                    onChange={() => handleSelectOne(stream._id)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold text-gray-900 truncate">{stream.title}</p>
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
                          <span className="text-sm text-gray-600 hover:text-blue-600">
                            {stream.astrologerId.name}
                          </span>
                        </Link>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="text-gray-600">{formatDuration(stream.startedAt, stream.endedAt)}</span>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-purple-500" />
                        <span>{formatNumber(stream.totalViews)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-pink-500" />
                        <span>{formatNumber(stream.likes)}</span>
                      </div>
                      {getStatusBadge(stream)}
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
                  className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(stream._id)}
                      onChange={() => handleSelectOne(stream._id)}
                      className="w-4 h-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-900">{stream.title}</p>
                        {getStatusBadge(stream)}
                      </div>
                      
                      {stream.description && (
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{stream.description}</p>
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
                            <p className="text-xs text-gray-500">Hosted by</p>
                            <p className="text-sm font-medium text-gray-900 hover:text-blue-600">
                              {stream.astrologerId.name}
                            </p>
                          </div>
                        </Link>
                      )}
                      
                      <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Duration</p>
                          <p className="font-medium text-gray-900">
                            {formatDuration(stream.startedAt, stream.endedAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Views</p>
                          <div className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5 text-purple-500" />
                            <span className="font-medium text-gray-900">{formatNumber(stream.totalViews)}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Likes</p>
                          <div className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5 text-pink-500" />
                            <span className="font-medium text-gray-900">{formatNumber(stream.likes)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {stream.isLive && (
                        <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg border border-red-200">
                          <Ban className="w-4 h-4" />
                          End Stream
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredStreams.length)} of {filteredStreams.length} streams
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
