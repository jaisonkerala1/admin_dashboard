import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Gift, 
  BarChart3, 
  Users, 
  Heart, 
  Eye, 
  TrendingUp,
  History,
  Calendar,
  Clock,
  User as UserIcon
} from 'lucide-react';
import { Modal, Card, Loader, EmptyState, RoundAvatar, StatCard, PillBadge } from '@/components/common';
import { liveStreamsApi } from '@/api/liveStreams';
import { socketService } from '@/services/socketService';
import { LiveStream, LiveComment, StreamDetailedStats } from '@/types/liveStream';
import { formatDateTime, formatNumber, formatCurrency } from '@/utils/formatters';

interface StreamDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  stream: LiveStream;
}

type TabType = 'analytics' | 'comments' | 'gifts';

export const StreamDetailModal = ({ isOpen, onClose, stream }: StreamDetailModalProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('analytics');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<StreamDetailedStats | null>(null);
  const [comments, setComments] = useState<LiveComment[]>([]);
  const [gifts, setGifts] = useState<LiveComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [giftsLoading, setGiftsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && stream._id) {
      loadStats();
      if (activeTab === 'comments') loadComments();
      if (activeTab === 'gifts') loadGifts();

      // Socket.IO Real-time Connection
      socketService.joinLiveStream(stream._id);

      const unregisterComment = socketService.onLiveComment((comment) => {
        if (comment.streamId === stream._id) {
          setComments(prev => [comment, ...prev].slice(0, 100));
          setStats(prev => prev ? {
            ...prev,
            engagementStats: {
              ...prev.engagementStats,
              comments: prev.engagementStats.comments + 1
            }
          } : null);
        }
      });

      const unregisterGift = socketService.onLiveGift((gift) => {
        if (gift.streamId === stream._id) {
          setGifts(prev => [gift, ...prev].slice(0, 100));
          setStats(prev => {
            if (!prev) return null;
            
            // Update top gifters
            const topGifters = [...prev.topGifters];
            const gifterIndex = topGifters.findIndex(g => g._id === gift.senderId);
            
            if (gifterIndex !== -1) {
              topGifters[gifterIndex] = {
                ...topGifters[gifterIndex],
                totalValue: topGifters[gifterIndex].totalValue + (gift.giftValue || 0),
                count: topGifters[gifterIndex].count + 1
              };
            } else {
              topGifters.push({
                _id: gift.senderId,
                userName: gift.senderName,
                userAvatar: gift.senderAvatar,
                totalValue: gift.giftValue || 0,
                count: 1
              });
            }
            
            // Sort and limit
            topGifters.sort((a, b) => b.totalValue - a.totalValue);
            
            return {
              ...prev,
              engagementStats: {
                ...prev.engagementStats,
                gifts: prev.engagementStats.gifts + 1,
                giftValue: prev.engagementStats.giftValue + (gift.giftValue || 0)
              },
              topGifters: topGifters.slice(0, 10)
            };
          });
        }
      });

      const unregisterLikes = socketService.onLiveLikeCount((data) => {
        if (data.streamId === stream._id) {
          setStats(prev => prev ? {
            ...prev,
            engagementStats: {
              ...prev.engagementStats,
              likes: data.count
            }
          } : null);
        }
      });

      const unregisterViewers = socketService.onLiveViewerCount((data) => {
        if (data.streamId === stream._id) {
          setStats(prev => prev ? {
            ...prev,
            viewerStats: {
              ...prev.viewerStats,
              current: data.count,
              peak: Math.max(prev.viewerStats.peak, data.count)
            }
          } : null);
        }
      });

      return () => {
        socketService.leaveLiveStream(stream._id);
        unregisterComment();
        unregisterGift();
        unregisterLikes();
        unregisterViewers();
      };
    }
  }, [isOpen, stream._id]);

  useEffect(() => {
    if (isOpen && stream._id) {
      if (activeTab === 'comments' && comments.length === 0) loadComments();
      if (activeTab === 'gifts' && gifts.length === 0) loadGifts();
    }
  }, [activeTab]);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const response = await liveStreamsApi.getStreamStats(stream._id);
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load stream stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      setCommentsLoading(true);
      const response = await liveStreamsApi.getComments(stream._id, { limit: 100 });
      if (response.success) {
        setComments(response.data);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const loadGifts = async () => {
    try {
      setGiftsLoading(true);
      const response = await liveStreamsApi.getGifts(stream._id, { limit: 100 });
      if (response.success) {
        setGifts(response.data);
      }
    } catch (error) {
      console.error('Failed to load gifts:', error);
    } finally {
      setGiftsLoading(false);
    }
  };

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'comments', label: 'Comments', icon: MessageSquare },
    { id: 'gifts', label: 'Gifts History', icon: Gift },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Stream Details & Analytics"
      size="xl"
    >
      <div className="space-y-6">
        {/* Stream Basic Info */}
        <div className="flex flex-col md:flex-row gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-gray-900 truncate">{stream.title}</h3>
              {stream.isLive ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white animate-pulse">
                  LIVE
                </span>
              ) : (
                <PillBadge variant="inactive" label="Ended" showDot={false} />
              )}
            </div>
            <p className="text-gray-500 text-sm mb-4 line-clamp-2">{stream.description || 'No description provided'}</p>
            
            <div className="flex flex-wrap gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDateTime(stream.startedAt || '')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{stream.category || 'General'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-600 font-medium">
                <UserIcon className="w-3.5 h-3.5" />
                <span>{stream.astrologerId?.name || 'Unknown Astrologer'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex-shrink-0 flex items-center">
            <RoundAvatar 
              src={stream.astrologerId?.profilePicture} 
              name={stream.astrologerId?.name} 
              size="lg" 
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-8 -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {isLoading ? (
                <div className="py-20 flex justify-center">
                  <Loader size="lg" text="Loading analytics..." />
                </div>
              ) : stats ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard 
                      title="Peak Viewers" 
                      value={formatNumber(stats.viewerStats.peak)} 
                      icon={TrendingUp} 
                      className="bg-blue-50/50 border-blue-100"
                    />
                    <StatCard 
                      title="Total Views" 
                      value={formatNumber(stats.viewerStats.total)} 
                      icon={Eye} 
                      className="bg-purple-50/50 border-purple-100"
                    />
                    <StatCard 
                      title="Likes" 
                      value={formatNumber(stats.engagementStats.likes)} 
                      icon={Heart} 
                      className="bg-pink-50/50 border-pink-100"
                    />
                    <StatCard 
                      title="Gift Value" 
                      value={formatCurrency(stats.engagementStats.giftValue)} 
                      icon={Gift} 
                      className="bg-amber-50/50 border-amber-100"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Engagement Breakdown */}
                    <Card className="p-5">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <History className="w-4 h-4 text-blue-600" />
                        Engagement Summary
                      </h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                          <span className="text-sm text-gray-600">Total Comments</span>
                          <span className="font-semibold text-gray-900">{formatNumber(stats.engagementStats.comments)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                          <span className="text-sm text-gray-600">Gifts Received</span>
                          <span className="font-semibold text-gray-900">{formatNumber(stats.engagementStats.gifts)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                          <span className="text-sm text-gray-600">Avg. Viewers</span>
                          <span className="font-semibold text-gray-900">{formatNumber(Math.round(stats.viewerStats.total / 2))}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-gray-600">Engagement Rate</span>
                          <span className="font-semibold text-green-600">
                            {((stats.engagementStats.likes + stats.engagementStats.comments) / (stats.viewerStats.total || 1) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </Card>

                    {/* Top Gifters Leaderboard */}
                    <Card className="p-5">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Users className="w-4 h-4 text-amber-600" />
                        Top Gifters
                      </h4>
                      {stats.topGifters.length > 0 ? (
                        <div className="space-y-3">
                          {stats.topGifters.map((gifter, index) => (
                            <div key={gifter._id} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-gray-400 w-4">#{index + 1}</span>
                                <RoundAvatar src={gifter.userAvatar} name={gifter.userName} size="sm" />
                                <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                                  {gifter.userName}
                                </span>
                              </div>
                              <span className="text-sm font-bold text-amber-600">{formatCurrency(gifter.totalValue)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-10 text-center text-gray-400 text-sm italic">
                          No gifts received yet
                        </div>
                      )}
                    </Card>
                  </div>
                </>
              ) : (
                <EmptyState icon={BarChart3} title="No analytics data available" />
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-4">
              {commentsLoading ? (
                <div className="py-20 flex justify-center">
                  <Loader size="md" text="Fetching comments..." />
                </div>
              ) : comments.length > 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-gray-600">User</th>
                        <th className="px-4 py-3 font-semibold text-gray-600">Message</th>
                        <th className="px-4 py-3 font-semibold text-gray-600">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {comments.map((comment) => (
                        <tr key={comment._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <RoundAvatar src={comment.userAvatar} name={comment.userName} size="sm" />
                              <span className="font-medium text-gray-900">{comment.userName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{comment.message}</td>
                          <td className="px-4 py-3 text-gray-400 text-xs">{formatDateTime(comment.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState icon={MessageSquare} title="No comments found" />
              )}
            </div>
          )}

          {activeTab === 'gifts' && (
            <div className="space-y-4">
              {giftsLoading ? (
                <div className="py-20 flex justify-center">
                  <Loader size="md" text="Fetching gift history..." />
                </div>
              ) : gifts.length > 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-gray-600">User</th>
                        <th className="px-4 py-3 font-semibold text-gray-600">Gift Type</th>
                        <th className="px-4 py-3 font-semibold text-gray-600">Value</th>
                        <th className="px-4 py-3 font-semibold text-gray-600">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {gifts.map((gift) => (
                        <tr key={gift._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <RoundAvatar src={gift.userAvatar} name={gift.userName} size="sm" />
                              <span className="font-medium text-gray-900">{gift.userName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 capitalize">
                            <div className="flex items-center gap-1.5">
                              <Gift className="w-3.5 h-3.5 text-amber-500" />
                              {gift.giftType || 'Unknown'}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-bold text-amber-600">{formatCurrency(gift.giftValue || 0)}</td>
                          <td className="px-4 py-3 text-gray-400 text-xs">{formatDateTime(gift.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState icon={Gift} title="No gifts found" />
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

