import { Link } from 'react-router-dom';
import { MessageSquare, CheckCircle, Star } from 'lucide-react';
import { getImageUrl } from '@/utils/helpers';
import { Astrologer } from '@/types';

interface OnlineAstrologerDetailCardProps {
  astrologer: Astrologer;
  onClick?: () => void;
  onMessage?: (astrologerId: string) => void;
}

/**
 * Detailed card design matching Flutter app's "Top Astrologers" card
 * Features:
 * - Profile picture with online indicator
 * - Verified badge (blue checkmark)
 * - Name with rating
 * - Specializations (orange tags)
 * - Orange Message button
 * - Minimal, clean design with proper spacing
 */
export const OnlineAstrologerDetailCard = ({ 
  astrologer, 
  onClick, 
  onMessage 
}: OnlineAstrologerDetailCardProps) => {
  const imageUrl = getImageUrl(astrologer.profilePicture);
  const initials = astrologer.name
    ? astrologer.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'A';

  // Format consultations count (890, 2.1k, etc.)
  const formatCount = (count?: number) => {
    if (!count) return '0';
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  const handleMessageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onMessage) {
      onMessage(astrologer._id);
    }
  };

  return (
    <Link
      to={`/astrologers/${astrologer._id}`}
      onClick={onClick}
      className="group block bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
    >
      {/* Top Section: Profile + Name + Message Button */}
      <div className="flex items-start gap-3 mb-3">
        {/* Profile Picture with Online Indicator */}
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={astrologer.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to initials on error
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const fallback = parent.querySelector('.initials-fallback') as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            
            {/* Fallback initials */}
            <div
              className="initials-fallback w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-lg"
              style={{ display: imageUrl ? 'none' : 'flex' }}
            >
              {initials}
            </div>
          </div>

          {/* Green Online Indicator */}
          <div 
            className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-gray-50 dark:border-gray-800"
            style={{
              boxShadow: '0 1px 3px rgba(34, 197, 94, 0.4)',
            }}
          />
        </div>

        {/* Name with Verified Badge */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
              {astrologer.name}
            </h3>
            {astrologer.isApproved && (
              <CheckCircle 
                className="w-4 h-4 text-orange-500 flex-shrink-0" 
                fill="currentColor"
              />
            )}
          </div>

          {/* Rating and Reviews Count */}
          <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-gray-600 text-gray-600 dark:fill-gray-400 dark:text-gray-400" />
              <span className="font-medium">{astrologer.rating ? astrologer.rating.toFixed(1) : '0.0'}</span>
            </div>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <span className="text-sm">{astrologer.experience || 0}y</span>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <span className="text-sm">{formatCount(astrologer.totalReviews || astrologer.totalConsultations)}</span>
          </div>
        </div>

        {/* Message Button */}
        <button
          onClick={handleMessageClick}
          className="flex-shrink-0 bg-orange-500 hover:bg-orange-600 text-white rounded-full px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 shadow-sm hover:shadow-md"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Message</span>
        </button>
      </div>

      {/* Specializations (Orange Tags) */}
      {astrologer.specialization && astrologer.specialization.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {astrologer.specialization.slice(0, 3).map((spec: string, index: number) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
            >
              {spec}
            </span>
          ))}
          {astrologer.specialization.length > 3 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
              +{astrologer.specialization.length - 3}
            </span>
          )}
        </div>
      )}
    </Link>
  );
};

