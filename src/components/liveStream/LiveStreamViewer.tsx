import { useEffect, useRef, useState } from 'react';
import AgoraRTC, { 
  IAgoraRTCClient, 
  IAgoraRTCRemoteUser
} from 'agora-rtc-sdk-ng';
import { 
  X, 
  Eye, 
  Clock, 
  Heart, 
  StopCircle, 
  Volume2, 
  VolumeX,
  AlertCircle,
  Loader2,
  Ban,
  AlertTriangle,
  Shield
} from 'lucide-react';
import { LiveStream } from '@/types';
import { formatNumber, formatRelativeTime } from '@/utils/formatters';
import { Avatar } from '@/components/common';
import { liveStreamsApi } from '@/api';
import { socketService } from '@/services/socketService';

interface LiveStreamViewerProps {
  stream: LiveStream;
  onClose: () => void;
  onEndStream?: () => void;
}

type OverlayMessage = {
  id: string;
  streamId: string;
  userName: string;
  userAvatar?: string | null;
  message: string;
  isGift?: boolean;
  giftType?: string | null;
  giftValue?: number;
  createdAt: string;
};

type FloatingHeart = { id: string; leftPx: number; sizePx: number; durationMs: number; emoji: string };

export const LiveStreamViewer = ({ stream, onClose, onEndStream }: LiveStreamViewerProps) => {
  const [client] = useState<IAgoraRTCClient>(AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }));
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showBanConfirm, setShowBanConfirm] = useState(false);
  const [showWarnDialog, setShowWarnDialog] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [viewerCount, setViewerCount] = useState<number>(stream.viewerCount || 0);
  const [likeCount, setLikeCount] = useState<number>(stream.likes || 0);
  const [floatingComments, setFloatingComments] = useState<OverlayMessage[]>([]);
  const [giftToasts, setGiftToasts] = useState<OverlayMessage[]>([]);
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTokenAndJoin();

    return () => {
      leaveChannel();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let unregisterComment: (() => void) | null = null;
    let unregisterGift: (() => void) | null = null;
    let unregisterLikes: (() => void) | null = null;
    let unregisterViewers: (() => void) | null = null;
    let unregisterReaction: (() => void) | null = null;

    const giftEmoji = (giftType?: string | null) => {
      switch ((giftType || '').toLowerCase()) {
        case 'rose': return '🌹';
        case 'star': return '⭐';
        case 'heart': return '❤️';
        case 'diamond': return '💎';
        case 'rainbow': return '🌈';
        case 'crown': return '👑';
        default: return '🎁';
      }
    };

    const pushHeart = (emoji: string = '❤️') => {
      const id = `heart_${Date.now()}_${Math.random().toString(16).slice(2)}`;
      const leftPx = Math.floor(Math.random() * 120);
      const sizePx = 18 + Math.floor(Math.random() * 12);
      const durationMs = 1800 + Math.floor(Math.random() * 700);
      const heart: FloatingHeart = { id, leftPx, sizePx, durationMs, emoji };
      setHearts(prev => [...prev, heart].slice(-25));
      window.setTimeout(() => {
        setHearts(prev => prev.filter(h => h.id !== id));
      }, durationMs);
    };

    const normalizeComment = (raw: any): OverlayMessage => {
      const createdAt =
        raw?.createdAt ??
        (raw?.timestamp ? new Date(raw.timestamp).toISOString() : new Date().toISOString());
      return {
        id: (raw?._id ?? raw?.id ?? `comment_${Date.now()}`).toString(),
        streamId: (raw?.streamId ?? stream._id).toString(),
        userName: raw?.userName ?? raw?.senderName ?? 'Unknown',
        userAvatar: raw?.userAvatar ?? raw?.senderAvatar ?? null,
        message: raw?.message ?? '',
        isGift: !!raw?.isGift,
        giftType: raw?.giftType ?? null,
        giftValue: raw?.giftValue ?? 0,
        createdAt,
      };
    };

    const normalizeGift = (raw: any): OverlayMessage => {
      const createdAt =
        raw?.createdAt ??
        (raw?.timestamp ? new Date(raw.timestamp).toISOString() : new Date().toISOString());
      return {
        id: (raw?._id ?? raw?.id ?? `gift_${Date.now()}`).toString(),
        streamId: (raw?.streamId ?? stream._id).toString(),
        userName: raw?.senderName ?? raw?.userName ?? 'Unknown',
        userAvatar: raw?.senderAvatar ?? raw?.userAvatar ?? null,
        message: raw?.message ?? `sent a ${raw?.giftType ?? 'gift'}`,
        isGift: true,
        giftType: raw?.giftType ?? null,
        giftValue: raw?.giftValue ?? 0,
        createdAt,
      };
    };

    (async () => {
      try {
        await socketService.connectAndWait();
        if (cancelled) return;
        socketService.joinLiveStream(stream._id);

        unregisterComment = socketService.onLiveComment((raw) => {
          if (raw?.streamId !== stream._id) return;
          const c = normalizeComment(raw);
          setFloatingComments(prev => [c, ...prev].slice(0, 5));
        });

        unregisterGift = socketService.onLiveGift((raw) => {
          if (raw?.streamId !== stream._id) return;
          const g = normalizeGift(raw);
          setGiftToasts(prev => [g, ...prev].slice(0, 3));
          pushHeart(giftEmoji(g.giftType)); // little celebration
          window.setTimeout(() => {
            setGiftToasts(prev => prev.filter(x => x.id !== g.id));
          }, 3500);
        });

        unregisterLikes = socketService.onLiveLikeCount((data) => {
          if (data?.streamId !== stream._id) return;
          setLikeCount(prev => {
            const next = typeof data?.count === 'number' ? data.count : prev;
            if (next > prev) {
              // animate a few hearts per increment (capped)
              const diff = Math.min(next - prev, 5);
              for (let i = 0; i < diff; i++) pushHeart('❤️');
            }
            return next;
          });
        });

        unregisterViewers = socketService.onLiveViewerCount((data) => {
          if (data?.streamId !== stream._id) return;
          if (typeof data?.count === 'number') setViewerCount(data.count);
        });

        unregisterReaction = socketService.onLiveReaction((data) => {
          if (data?.streamId !== stream._id) return;
          pushHeart(data?.reactionType || '❤️');
        });
      } catch (e) {
        // non-fatal: viewer still works without socket overlays
        console.warn('[LiveStreamViewer] Socket overlay unavailable:', e);
      }
    })();

    return () => {
      cancelled = true;
      try {
        socketService.leaveLiveStream(stream._id);
      } catch {}
      unregisterComment?.();
      unregisterGift?.();
      unregisterLikes?.();
      unregisterViewers?.();
      unregisterReaction?.();
    };
  }, [stream._id]);

  const fetchTokenAndJoin = async () => {
    try {
      setIsLoading(true);
      setError('');

      console.log('🔴 Fetching token for stream:', stream._id);
      console.log('🔴 Stream isLive:', stream.isLive);
      console.log('🔴 API URL:', import.meta.env.VITE_API_BASE_URL || '/api');

      // Check if stream is actually live
      if (!stream.isLive) {
        throw new Error('This stream is no longer live');
      }

      // Fetch Agora token from backend
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL || '/api'}/admin/live-streams/${stream._id}/token`;
      console.log('🔴 Fetching token from:', apiUrl);

      const response = await fetch(apiUrl, {
        headers: {
          'x-admin-key': import.meta.env.VITE_ADMIN_SECRET_KEY || ''
        }
      });

      console.log('🔴 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('🔴 Token error:', errorData);
        throw new Error(errorData.message || 'Failed to get stream token');
      }

      const data = await response.json();
      console.log('🔴 Full response data:', data);
      console.log('🔴 Token received:', { hasToken: !!data.data.token, appId: data.data.appId });

      const { token, channelName, appId } = data.data;
      
      console.log('🔴 Extracted values:', { token: token?.substring(0, 20) + '...', channelName, appId });

      if (!token || !appId) {
        throw new Error('Agora credentials not configured on server');
      }

      await joinChannel(appId, channelName, token);
    } catch (err: any) {
      console.error('🔴 Failed to fetch token:', err);
      setError(err.message || 'Failed to connect to live stream');
      setIsLoading(false);
    }
  };

  const joinChannel = async (appId: string, channelName: string, token: string) => {
    try {
      console.log('🔴 Joining Agora channel:', { appId, channelName, hasToken: !!token });

      // Set up event listeners
      client.on('user-published', handleUserPublished);
      client.on('user-unpublished', handleUserUnpublished);
      client.on('user-left', handleUserLeft);

      // Join channel with token
      const uid = await client.join(
        appId,
        channelName,
        token,
        null  // UID (null = auto-generate)
      );

      console.log('🔴 Successfully joined channel with UID:', uid);
      console.log('🔴 Remote users:', client.remoteUsers.length);

      setIsJoined(true);
      setIsLoading(false);
    } catch (err: any) {
      console.error('🔴 Failed to join channel:', err);
      console.error('🔴 Error details:', {
        code: err.code,
        message: err.message,
        name: err.name
      });
      setError(err.message || 'Failed to join live stream. Check if Agora credentials are configured.');
      setIsLoading(false);
    }
  };

  const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
    await client.subscribe(user, mediaType);

    if (mediaType === 'video') {
      setRemoteUsers((prev) => {
        const exists = prev.find((u) => u.uid === user.uid);
        if (exists) return prev;
        return [...prev, user];
      });

      // Play video in the ref container
      const remoteVideoTrack = user.videoTrack;
      if (remoteVideoTrack && videoRef.current) {
        remoteVideoTrack.play(videoRef.current);
      }
    }

    if (mediaType === 'audio') {
      const remoteAudioTrack = user.audioTrack;
      remoteAudioTrack?.play();
    }
  };

  const handleUserUnpublished = (user: IAgoraRTCRemoteUser) => {
    setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
  };

  const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
    setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
  };

  const leaveChannel = async () => {
    try {
      await client.leave();
      setIsJoined(false);
    } catch (err) {
      console.error('Failed to leave channel:', err);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    remoteUsers.forEach((user) => {
      if (user.audioTrack) {
        if (isMuted) {
          user.audioTrack.play();
        } else {
          user.audioTrack.stop();
        }
      }
    });
  };

  const handleEndStream = async () => {
    if (onEndStream) {
      await leaveChannel();
      onEndStream();
    }
  };

  const handleBanStream = async () => {
    try {
      await liveStreamsApi.ban(stream._id, 'Content violates community guidelines');
      setShowBanConfirm(false);
      await leaveChannel();
      onClose();
      if (onEndStream) onEndStream();
    } catch (err) {
      console.error('Failed to ban stream:', err);
      alert('Failed to ban stream. Please try again.');
    }
  };

  const handleSendWarning = async () => {
    if (!warningMessage.trim()) return;
    try {
      await liveStreamsApi.warn(stream._id, warningMessage);
      setShowWarnDialog(false);
      setWarningMessage('');
      alert('Warning sent successfully!');
    } catch (err) {
      console.error('Failed to send warning:', err);
      alert('Failed to send warning. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="relative w-full max-w-6xl bg-black rounded-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar
                src={stream.astrologerId?.profilePicture}
                name={stream.astrologerId?.name || 'Astrologer'}
                size="md"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-white font-semibold">
                    {stream.astrologerId?.name || 'Unknown Astrologer'}
                  </h2>
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white text-xs font-medium rounded">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    LIVE
                  </span>
                </div>
                <p className="text-gray-300 text-sm">{stream.title}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Video Container */}
        <div className="relative aspect-video bg-gray-900">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-12 h-12 text-white animate-spin" />
              <p className="text-white">Joining live stream...</p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <p className="text-white text-center">{error}</p>
              <button
                onClick={fetchTokenAndJoin}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Retry
              </button>
            </div>
          )}

          <div ref={videoRef} className="w-full h-full" />

          {/* Floating Hearts (likes/reactions) */}
          <div className="pointer-events-none absolute inset-0 z-20">
            {hearts.map((h) => (
              <div
                key={h.id}
                className="absolute bottom-24 right-6"
                style={{
                  transform: `translateX(-${h.leftPx}px)`,
                  animation: `ls-heart-float ${h.durationMs}ms ease-out forwards`,
                  fontSize: `${h.sizePx}px`,
                  opacity: 0.95,
                  filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.35))',
                }}
              >
                {h.emoji}
              </div>
            ))}
          </div>

          {/* Floating Comments (bottom-left) */}
          {isJoined && !error && (
            <div className="absolute bottom-20 left-4 z-20 w-[320px] max-w-[75%] space-y-2 pointer-events-none">
              {floatingComments.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  className="flex items-start gap-2 rounded-xl bg-black/45 backdrop-blur px-3 py-2 border border-white/10"
                >
                  <div className="mt-0.5">
                    <Avatar
                      src={c.userAvatar || undefined}
                      name={c.userName || 'U'}
                      size="sm"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white/90 truncate">
                      {c.userName}
                      {c.isGift ? <span className="ml-2 text-amber-300">Gift</span> : null}
                    </div>
                    <div className="text-xs text-white/80 leading-snug line-clamp-2">
                      {c.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Gift Toasts (center) */}
          {isJoined && !error && giftToasts.length > 0 && (
            <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 w-[360px] max-w-[80%] space-y-2 pointer-events-none">
              {giftToasts.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center gap-3 rounded-2xl bg-black/55 backdrop-blur px-4 py-3 border border-amber-300/25 shadow-lg"
                  style={{ animation: 'ls-toast-in 240ms ease-out both' }}
                >
                  <div className="text-2xl">
                    {(() => {
                      const t = (g.giftType || '').toLowerCase();
                      if (t === 'rose') return '🌹';
                      if (t === 'star') return '⭐';
                      if (t === 'heart') return '❤️';
                      if (t === 'diamond') return '💎';
                      if (t === 'rainbow') return '🌈';
                      if (t === 'crown') return '👑';
                      return '🎁';
                    })()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{g.userName}</div>
                    <div className="text-xs text-white/80 truncate">
                      sent <span className="text-amber-200 font-semibold">{g.giftType || 'a gift'}</span>
                      {typeof g.giftValue === 'number' && g.giftValue > 0 ? (
                        <span className="ml-2 text-amber-200">₹{g.giftValue}</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <style>{`
            @keyframes ls-heart-float {
              0% { transform: translate3d(0, 0, 0) scale(0.85); opacity: 0.95; }
              25% { transform: translate3d(0, -60px, 0) scale(1.05); opacity: 1; }
              100% { transform: translate3d(0, -220px, 0) scale(1.15); opacity: 0; }
            }
            @keyframes ls-toast-in {
              0% { transform: translateY(-8px); opacity: 0; }
              100% { transform: translateY(0); opacity: 1; }
            }
          `}</style>

          {/* Stats Overlay */}
          {isJoined && !error && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-white">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    <span className="font-semibold">{formatNumber(viewerCount || 0)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    <span className="font-semibold">{formatNumber(likeCount || 0)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{formatRelativeTime(stream.startedAt || stream.createdAt)}</span>
                  </div>
                </div>

                {/* Admin Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5 text-white" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-white" />
                    )}
                  </button>

                  <button
                    onClick={() => setShowAdminMenu(!showAdminMenu)}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors relative"
                    title="Admin Controls"
                  >
                    <Shield className="w-5 h-5 text-white" />
                  </button>

                  {/* Admin Menu Dropdown */}
                  {showAdminMenu && (
                    <div className="absolute bottom-16 right-4 bg-white rounded-lg shadow-xl p-2 min-w-[200px] z-30">
                      <button
                        onClick={() => {
                          setShowWarnDialog(true);
                          setShowAdminMenu(false);
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-100 rounded-lg"
                      >
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        <span>Send Warning</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowBanConfirm(true);
                          setShowAdminMenu(false);
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-100 rounded-lg text-red-600"
                      >
                        <Ban className="w-4 h-4" />
                        <span>Ban Stream</span>
                      </button>
                    </div>
                  )}

                  {onEndStream && (
                    <button
                      onClick={() => setShowEndConfirm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    >
                      <StopCircle className="w-5 h-5" />
                      <span>End Stream</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* End Stream Confirmation */}
        {showEndConfirm && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-2">End Live Stream?</h3>
              <p className="text-gray-600 mb-4">
                This will end the stream for all {formatNumber(stream.viewerCount || 0)} viewers. This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowEndConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEndStream}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  End Stream
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Ban Stream Confirmation */}
        {showBanConfirm && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <Ban className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold">Ban Live Stream?</h3>
              </div>
              <p className="text-gray-600 mb-4">
                This will immediately end and ban the stream. The broadcaster will be notified and the stream will be marked as banned. This is a serious action for policy violations.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowBanConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBanStream}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Ban Stream
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Send Warning Dialog */}
        {showWarnDialog && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4 w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold">Send Warning</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Send a warning message to the broadcaster. This will appear as a notification during their live stream.
              </p>
              <textarea
                value={warningMessage}
                onChange={(e) => setWarningMessage(e.target.value)}
                placeholder="Enter warning message..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 mb-4"
                rows={3}
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowWarnDialog(false);
                    setWarningMessage('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendWarning}
                  disabled={!warningMessage.trim()}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Warning
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

