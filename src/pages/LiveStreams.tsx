import { useEffect, useState } from 'react';
import { Search, StopCircle, Radio } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, Loader, EmptyState, Avatar, StatusBadge } from '@/components/common';
import { liveStreamsApi } from '@/api';
import { LiveStream } from '@/types';
import { formatDateTime, formatNumber } from '@/utils/formatters';

export const LiveStreams = () => {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadStreams();
    // Auto-refresh every 10 seconds for live streams
    const interval = setInterval(loadStreams, 10000);
    return () => clearInterval(interval);
  }, [search]);

  const loadStreams = async () => {
    try {
      setIsLoading(true);
      const response = await liveStreamsApi.getAll({ search, sortBy: 'createdAt', sortOrder: 'desc' });
      setStreams(response.data?.data || []);
    } catch (err) {
      console.error('Failed to load live streams:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndStream = async (id: string) => {
    if (!confirm('Are you sure you want to force-end this live stream?')) return;
    try {
      await liveStreamsApi.end(id, { reason: 'Ended by admin' });
      await loadStreams();
    } catch (err) {
      console.error('Failed to end stream:', err);
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="Live Streams Monitoring"
        subtitle="Monitor and manage all live streams"
      />

      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search live streams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-12">
            <Loader size="lg" text="Loading live streams..." />
          </div>
        ) : streams.length === 0 ? (
          <EmptyState
            icon={Radio}
            title="No live streams found"
            description="There are currently no live streams"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {streams.map((stream) => (
              <div key={stream._id} className="card p-0 overflow-hidden">
                {/* Thumbnail */}
                <div className="relative h-48 bg-gray-100">
                  {stream.thumbnailUrl ? (
                    <img
                      src={stream.thumbnailUrl}
                      alt={stream.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Radio className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  {stream.status === 'live' && (
                    <div className="absolute top-3 right-3 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      LIVE
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{stream.title}</h3>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Avatar
                      src={stream.astrologerId.profilePicture}
                      name={stream.astrologerId.name}
                      size="sm"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{stream.astrologerId.name}</p>
                      <p className="text-xs text-gray-500">{formatDateTime(stream.scheduledAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{formatNumber(stream.viewerCount)} viewers</span>
                      <span>Peak: {formatNumber(stream.peakViewers)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <StatusBadge status={stream.status} />
                    {stream.status === 'live' && (
                      <button
                        onClick={() => handleEndStream(stream._id)}
                        className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        <StopCircle className="w-4 h-4" />
                        End Stream
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </MainLayout>
  );
};

