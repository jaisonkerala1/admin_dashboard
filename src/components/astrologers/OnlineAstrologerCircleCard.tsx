import { Link } from 'react-router-dom';
import { getImageUrl } from '@/utils/helpers';
import { Astrologer } from '@/types';

interface OnlineAstrologerCircleCardProps {
  astrologer: Astrologer;
  onClick?: () => void;
}

/**
 * World-class circular card design matching Flutter app's LiveAstrologerCircleWidget
 * Features:
 * - Coral-red gradient border (exact Flutter colors: #FF5757 → #FF6B6B)
 * - Green online status indicator (bottom-right)
 * - Centered name below circle
 * - Smooth hover animations
 * - Responsive sizing (larger on desktop)
 */
export const OnlineAstrologerCircleCard = ({ astrologer, onClick }: OnlineAstrologerCircleCardProps) => {
  const imageUrl = getImageUrl(astrologer.profilePicture);
  const initials = astrologer.name
    ? astrologer.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'A';

  return (
    <Link
      to={`/astrologers/${astrologer._id}`}
      onClick={onClick}
      className="group flex flex-col items-center cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95"
    >
      {/* Main Circle Container with Gradient Border */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24">
        {/* Outer gradient border - Coral-red gradient matching Flutter */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #FF5757 0%, #FF6B6B 100%)',
            padding: '3px',
            boxShadow: '0 2px 8px rgba(255, 87, 87, 0.25)',
          }}
        >
          {/* Inner white/dark background to create border effect */}
          <div className="w-full h-full rounded-full bg-white dark:bg-gray-800" />
        </div>

        {/* Inner circle with profile picture */}
        <div className="absolute inset-[3px] rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-md">
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
            className="initials-fallback w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-lg sm:text-xl lg:text-2xl"
            style={{ display: imageUrl ? 'none' : 'flex' }}
          >
            {initials}
          </div>
        </div>

        {/* Green Online Status Indicator - Bottom Right (exact Flutter position) */}
        <div 
          className="absolute bottom-0 right-0 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"
          style={{
            boxShadow: '0 1px 3px rgba(34, 197, 94, 0.4)',
          }}
        >
          {/* Inner white dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full" />
          </div>
        </div>
      </div>

      {/* Spacing between circle and name */}
      <div className="h-1.5 sm:h-2 lg:h-2.5" />

      {/* Astrologer Name - Centered, Truncated */}
      <div className="w-full max-w-[80px] sm:max-w-[100px] lg:max-w-[120px]">
        <p
          className="text-center text-xs sm:text-sm lg:text-base font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
          title={astrologer.name}
        >
          {astrologer.name}
        </p>
      </div>

      {/* Optional: Rating/Sessions (Compact) - Matching Flutter viewer count style */}
      {(astrologer.rating || astrologer.totalConsultations) && (
        <>
          <div className="h-1 sm:h-1.5" />
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
            {astrologer.rating && (
              <>
                <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                  ⭐ {astrologer.rating.toFixed(1)}
                </span>
                {astrologer.totalConsultations && (
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                )}
              </>
            )}
            {astrologer.totalConsultations && (
              <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                {astrologer.totalConsultations > 1000
                  ? `${(astrologer.totalConsultations / 1000).toFixed(1)}k`
                  : astrologer.totalConsultations}
              </span>
            )}
          </div>
        </>
      )}
    </Link>
  );
};

