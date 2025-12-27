import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Play } from 'lucide-react';
import { RoundAvatar } from '@/components/common';
import { formatNumber } from '@/utils/formatters';
import { ROUTES } from '@/utils/constants';
import { getImageUrl } from '@/utils/helpers';

interface LiveStream {
  _id: string;
  title?: string;
  astrologerId?: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  thumbnailUrl?: string;
  viewerCount?: number;
  isLive?: boolean;
}

interface LiveStreamStoryRoundsProps {
  streams: LiveStream[];
  onStreamClick?: (stream: LiveStream) => void;
}

export const LiveStreamStoryRounds: React.FC<LiveStreamStoryRoundsProps> = ({
  streams,
  onStreamClick,
}) => {
  if (streams.length === 0) {
    return null;
  }

  const handleClick = (stream: LiveStream) => {
    if (onStreamClick) {
      onStreamClick(stream);
    }
  };

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <div className="absolute inset-0 w-2 h-2 bg-red-500 rounded-full animate-ping opacity-75" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Live Now</h3>
          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
            {streams.length}
          </span>
        </div>
      </div>

      {/* Horizontal Scrollable Story Rounds */}
      <div className="overflow-x-auto -mx-4 px-4 pb-2 scrollbar-hide">
        <div className="flex gap-4 min-w-max">
          {streams.map((stream) => {
            const astrologerName = stream.astrologerId?.name || 'Unknown';
            const profilePicture = stream.astrologerId?.profilePicture;
            const thumbnailUrl = stream.thumbnailUrl;
            const viewerCount = stream.viewerCount || 0;

            return (
              <div
                key={stream._id}
                className="flex-shrink-0 flex flex-col items-center cursor-pointer group"
                onClick={() => handleClick(stream)}
              >
                {/* Story Circle with Gradient Border */}
                <div className="relative mb-2">
                  {/* Gradient Border - Instagram Style */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500 via-red-400 to-red-600 p-0.5 animate-pulse group-hover:scale-105 transition-transform">
                    <div className="w-full h-full rounded-full bg-white" />
                  </div>
                  
                  {/* Inner Circle with Image */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                    <div className="absolute inset-0.5 rounded-full bg-white overflow-hidden shadow-md">
                      {thumbnailUrl ? (
                        <img
                          src={getImageUrl(thumbnailUrl)}
                          alt={astrologerName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-full h-full rounded-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600 ${
                          thumbnailUrl ? 'hidden' : 'flex'
                        }`}
                      >
                        <span className="text-white font-semibold text-lg sm:text-xl">
                          {astrologerName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* LIVE Badge - Top Left */}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 transform">
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      <span className="text-white text-[9px] sm:text-[10px] font-bold tracking-wide">
                        LIVE
                      </span>
                    </div>
                  </div>

                  {/* Online Status Indicator - Bottom Right */}
                  <div className="absolute -bottom-0.5 -right-0.5">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full border-2 border-white shadow-md flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Astrologer Name */}
                <div className="w-20 sm:w-24 text-center mb-1.5">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                    {astrologerName}
                  </p>
                </div>

                {/* Viewer Count */}
                <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-50 rounded-full border border-gray-200">
                  <Eye className="w-3 h-3 text-gray-500" />
                  <span className="text-xs font-medium text-gray-600">
                    {viewerCount >= 1000 ? `${(viewerCount / 1000).toFixed(1)}k` : formatNumber(viewerCount)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Scrollbar Hide Styles */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

