import { useState, useEffect, useRef } from 'react';
import AgoraRTC, {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng';
import { Phone, Mic, MicOff, Video, VideoOff, X } from 'lucide-react';
import type { Astrologer } from '@/types';
import { RoundAvatar } from '@/components/common/RoundAvatar';

interface VideoCallWindowProps {
  astrologer: Astrologer;
  channelName: string;
  agoraToken: string;
  callType: 'voice' | 'video';
  onEnd: () => void;
}

const APP_ID = import.meta.env.VITE_AGORA_APP_ID || '';

export const VideoCallWindow = ({
  astrologer,
  channelName,
  agoraToken,
  callType,
  onEnd,
}: VideoCallWindowProps) => {
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(callType === 'voice');
  const [isConnected, setIsConnected] = useState(false);
  const [duration, setDuration] = useState(0);

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const localVideoTrackRef = useRef<ICameraVideoTrack | null>(null);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    initializeAgora();

    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (isConnected) {
      durationIntervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    };
  }, [isConnected]);

  const initializeAgora = async () => {
    try {
      // Create client
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      clientRef.current = client;

      // Handle remote user
      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        
        if (mediaType === 'video') {
          const remoteVideoTrack = user.videoTrack;
          if (remoteVideoTrack && remoteVideoRef.current) {
            remoteVideoTrack.play(remoteVideoRef.current);
          }
        }
        
        if (mediaType === 'audio') {
          const remoteAudioTrack = user.audioTrack;
          remoteAudioTrack?.play();
        }
      });

      client.on('user-unpublished', (_user, mediaType) => {
        if (mediaType === 'video' && remoteVideoRef.current) {
          remoteVideoRef.current.innerHTML = '';
        }
      });

      client.on('user-left', () => {
        handleEnd();
      });

      // Join channel
      await client.join(APP_ID, channelName, agoraToken, null);

      // Create and publish local tracks
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      localAudioTrackRef.current = audioTrack;

      if (callType === 'video') {
        const videoTrack = await AgoraRTC.createCameraVideoTrack();
        localVideoTrackRef.current = videoTrack;
        
        if (localVideoRef.current) {
          videoTrack.play(localVideoRef.current);
        }

        await client.publish([audioTrack, videoTrack]);
      } else {
        await client.publish([audioTrack]);
      }

      setIsConnected(true);
    } catch (error) {
      console.error('Failed to initialize Agora:', error);
      handleEnd();
    }
  };

  const cleanup = async () => {
    try {
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.close();
      }
      if (localVideoTrackRef.current) {
        localVideoTrackRef.current.close();
      }
      if (clientRef.current) {
        await clientRef.current.leave();
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  };

  const toggleAudio = () => {
    if (localAudioTrackRef.current) {
      localAudioTrackRef.current.setEnabled(isAudioMuted);
      setIsAudioMuted(!isAudioMuted);
    }
  };

  const toggleVideo = () => {
    if (localVideoTrackRef.current) {
      localVideoTrackRef.current.setEnabled(isVideoMuted);
      setIsVideoMuted(!isVideoMuted);
    }
  };

  const handleEnd = () => {
    cleanup();
    onEnd();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/50 to-transparent z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RoundAvatar
              src={astrologer.profilePicture}
              name={astrologer.name}
              size="md"
            />
            <div>
              <h3 className="text-white font-semibold">{astrologer.name}</h3>
              <p className="text-gray-300 text-sm">
                {isConnected ? formatDuration(duration) : 'Connecting...'}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleEnd}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Video containers */}
      <div className="flex-1 relative">
        {/* Remote video (full screen) */}
        <div ref={remoteVideoRef} className="w-full h-full bg-gray-800">
          {!isConnected && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <RoundAvatar
                  src={astrologer.profilePicture}
                  name={astrologer.name}
                  size="lg"
                />
                <p className="mt-4 text-white text-lg">Calling {astrologer.name}...</p>
              </div>
            </div>
          )}
        </div>

        {/* Local video (picture-in-picture) */}
        {callType === 'video' && !isVideoMuted && (
          <div
            ref={localVideoRef}
            className="absolute top-20 right-6 w-32 h-40 bg-gray-700 rounded-lg overflow-hidden shadow-lg"
          />
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/50 to-transparent">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full transition-colors ${
              isAudioMuted
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {isAudioMuted ? (
              <MicOff className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </button>

          {callType === 'video' && (
            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full transition-colors ${
                isVideoMuted
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {isVideoMuted ? (
                <VideoOff className="w-6 h-6 text-white" />
              ) : (
                <Video className="w-6 h-6 text-white" />
              )}
            </button>
          )}

          <button
            onClick={handleEnd}
            className="p-4 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
          >
            <Phone className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

