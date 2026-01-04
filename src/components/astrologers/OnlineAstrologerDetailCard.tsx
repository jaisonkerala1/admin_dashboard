import { Link } from 'react-router-dom';
import { MessageSquare, BadgeCheck, Star } from 'lucide-react';
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
      className="group block bg-[#F8F9FA] dark:bg-card rounded-2xl p-3 sm:p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-1 border border-gray-200 dark:border-border"
    >
      {/* Top Section: Profile + Name + Message Button */}
      <div className="flex items-start gap-2 sm:gap-3 mb-3">
        {/* Profile Picture with Online Indicator */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-white dark:bg-muted border border-gray-200 dark:border-border">
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
              className="initials-fallback w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 dark:from-primary-500 dark:to-primary-700 flex items-center justify-center text-white font-semibold text-base sm:text-lg"
              style={{ display: imageUrl ? 'none' : 'flex' }}
            >
              {initials}
            </div>
          </div>

          {/* Green Online Indicator */}
          <div 
            className="absolute bottom-0 right-0 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-card"
            style={{
              boxShadow: '0 1px 3px rgba(34, 197, 94, 0.4)',
            }}
          />
        </div>

        {/* Name with Verified Badge */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-1.5 mb-1">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-foreground truncate">
              {astrologer.name}
            </h3>
            {astrologer.isVerified && (
              <BadgeCheck 
                className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-[#1877F2] flex-shrink-0" 
                strokeWidth={2}
              />
            )}
          </div>

          {/* Rating and Reviews Count */}
          <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-gray-600 dark:text-muted-foreground flex-wrap">
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-gray-500 dark:fill-muted-foreground text-gray-500 dark:text-muted-foreground flex-shrink-0" />
              <span className="font-medium whitespace-nowrap">{astrologer.rating ? astrologer.rating.toFixed(1) : '0.0'}</span>
            </div>
            <span className="text-gray-300 dark:text-muted-foreground/50 flex-shrink-0">•</span>
            <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-muted-foreground whitespace-nowrap">{astrologer.experience || 0}y</span>
            <span className="text-gray-300 dark:text-muted-foreground/50 flex-shrink-0">•</span>
            <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-muted-foreground whitespace-nowrap">{formatCount(astrologer.totalReviews || astrologer.totalConsultations)}</span>
          </div>
        </div>

        {/* Message Button */}
        <button
          onClick={handleMessageClick}
          className="flex-shrink-0 bg-orange-500 dark:bg-primary-600 hover:bg-orange-600 dark:hover:bg-primary-700 text-white rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 sm:gap-2 shadow-sm hover:shadow-md whitespace-nowrap"
        >
          <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="hidden sm:inline">Message</span>
          <span className="sm:hidden">Msg</span>
        </button>
      </div>

      {/* Specializations (Orange Tags) */}
      {astrologer.specialization && astrologer.specialization.length > 0 && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
          {astrologer.specialization.slice(0, 3).map((spec: string, index: number) => (
            <span
              key={index}
              className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] uppercase tracking-wider font-bold bg-[#FFF4E5] dark:bg-primary-900/30 text-orange-700 dark:text-primary-400 border border-orange-100 dark:border-primary-800"
            >
              {spec}
            </span>
          ))}
          {astrologer.specialization.length > 3 && (
            <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold bg-white dark:bg-muted text-gray-500 dark:text-muted-foreground border border-gray-200 dark:border-border">
              +{astrologer.specialization.length - 3}
            </span>
          )}
        </div>
      )}
    </Link>
  );
};

