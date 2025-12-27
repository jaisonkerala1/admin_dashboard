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
      className="group block bg-white dark:bg-gray-800 rounded-2xl p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
    >
      {/* Top Section: Profile + Message Button */}
      <div className="flex items-start gap-3 mb-3">
        {/* Profile Picture with Online Indicator */}
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600">
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
              className="initials-fallback w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-xl"
              style={{ display: imageUrl ? 'none' : 'flex' }}
            >
              {initials}
            </div>
          </div>

          {/* Green Online Indicator */}
          <div 
            className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"
            style={{
              boxShadow: '0 1px 3px rgba(34, 197, 94, 0.4)',
            }}
          />
        </div>

        {/* Name, Verified, Rating */}
        <div className="flex-1 min-w-0">
          {/* Name with Verified Badge */}
          <div className="flex items-center gap-1.5 mb-1">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
              {astrologer.name}
            </h3>
            {astrologer.isVerified && (
              <CheckCircle 
                className="w-4 h-4 text-orange-500 flex-shrink-0" 
                fill="currentColor"
              />
            )}
          </div>

          {/* Rating and Consultations Count */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            {astrologer.rating && (
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">{astrologer.rating.toFixed(1)}</span>
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              </div>
            )}
            {astrologer.rating && (astrologer.totalConsultations || astrologer.totalConsultations === 0) && (
              <span className="text-gray-300 dark:text-gray-600">•</span>
            )}
            {(astrologer.totalConsultations || astrologer.totalConsultations === 0) && (
              <span className="text-sm">{formatCount(astrologer.totalConsultations)}</span>
            )}
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
      {astrologer.specializations && astrologer.specializations.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {astrologer.specializations.slice(0, 3).map((spec, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
            >
              {spec}
            </span>
          ))}
          {astrologer.specializations.length > 3 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
              +{astrologer.specializations.length - 3} more
            </span>
          )}
        </div>
      )}
    </Link>
  );
};

