import { useEffect, useRef, useState } from 'react';
import AgoraRTC, { 
  IAgoraRTCClient, 
  IAgoraRTCRemoteUser, 
  ICameraVideoTrack, 
  IMicrophoneAudioTrack 
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
  Loader2
} from 'lucide-react';
import { LiveStream } from '@/types';
import { formatNumber, formatRelativeTime } from '@/utils/formatters';
import { Avatar } from '@/components/common';

interface LiveStreamViewerProps {
  stream: LiveStream;
  onClose: () => void;
  onEndStream?: () => void;
}

export const LiveStreamViewer = ({ stream, onClose, onEndStream }: LiveStreamViewerProps) => {
  const [client] = useState<IAgoraRTCClient>(AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }));
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [agoraConfig, setAgoraConfig] = useState<{ appId: string; token: string; channelName: string } | null>(null);
  
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTokenAndJoin();

    return () => {
      leaveChannel();
    };
  }, []);

  const fetchTokenAndJoin = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Fetch Agora token from backend
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/admin/live-streams/${stream._id}/token`, {
        headers: {
          'x-admin-key': import.meta.env.VITE_ADMIN_SECRET_KEY || ''
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get stream token');
      }

      const data = await response.json();
      const { token, channelName, appId } = data.data;

      setAgoraConfig({ appId, token, channelName });
      await joinChannel(appId, channelName, token);
    } catch (err: any) {
      console.error('Failed to fetch token:', err);
      setError(err.message || 'Failed to connect to live stream');
      setIsLoading(false);
    }
  };

  const joinChannel = async (appId: string, channelName: string, token: string) => {
    try {
      // Set up event listeners
      client.on('user-published', handleUserPublished);
      client.on('user-unpublished', handleUserUnpublished);
      client.on('user-left', handleUserLeft);

      // Join channel with token
      await client.join(
        appId,
        channelName,
        token,
        null  // UID (null = auto-generate)
      );

      setIsJoined(true);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Failed to join channel:', err);
      setError(err.message || 'Failed to join live stream');
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

          {/* Stats Overlay */}
          {isJoined && !error && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-white">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    <span className="font-semibold">{formatNumber(stream.viewerCount || 0)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    <span className="font-semibold">{formatNumber(stream.likes || 0)}</span>
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
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5 text-white" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-white" />
                    )}
                  </button>

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
      </div>
    </div>
  );
};

