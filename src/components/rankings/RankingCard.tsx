import { Pin, Eye, EyeOff, GripVertical } from 'lucide-react';
import { Avatar } from '@/components/common';
import { AstrologerRanking, RankingCategoryId } from '@/types';
import { formatNumber } from '@/utils/formatters';
import { cn } from '@/utils/helpers';

interface RankingCardProps {
  astrologer: AstrologerRanking;
  rank: number;
  category: RankingCategoryId;
  onPin: (id: string) => void;
  onUnpin: (id: string) => void;
  onHide: (id: string) => void;
  onUnhide: (id: string) => void;
  isDraggable?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

export const RankingCard = ({
  astrologer,
  rank,
  category,
  onPin,
  onUnpin,
  onHide,
  onUnhide,
  isDraggable = false,
  isSelected = false,
  onSelect,
}: RankingCardProps) => {
  const getScoreDisplay = () => {
    switch (category) {
      case 'top':
        return `${astrologer.rating.toFixed(1)} ⭐ (${formatNumber(astrologer.totalReviews)} reviews)`;
      case 'experienced':
        return `${astrologer.experience} years`;
      case 'popular':
        return `${formatNumber(astrologer.totalConsultations)} consultations`;
      case 'trending':
        return `Score: ${astrologer.trendingScore.toFixed(1)}`;
      default:
        return '';
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 bg-white border rounded-lg transition-all',
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300',
        astrologer.isHidden && 'opacity-50'
      )}
    >
      {/* Drag Handle */}
      {isDraggable && (
        <div className="cursor-move text-gray-400 hover:text-gray-600">
          <GripVertical className="w-5 h-5" />
        </div>
      )}

      {/* Selection Checkbox */}
      {onSelect && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(astrologer.astrologerId)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
      )}

      {/* Rank Badge */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-700">
        {rank}
      </div>

      {/* Avatar */}
      <Avatar
        src={astrologer.profilePicture}
        name={astrologer.name}
        size="md"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 truncate">{astrologer.name}</h3>
          {astrologer.isPinned && (
            <Pin className="w-4 h-4 text-amber-600 fill-amber-600" />
          )}
          {astrologer.isHidden && (
            <EyeOff className="w-4 h-4 text-gray-400" />
          )}
        </div>
        <p className="text-sm text-gray-600">{getScoreDisplay()}</p>
        {astrologer.specialization && astrologer.specialization.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            {astrologer.specialization.slice(0, 2).join(', ')}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {astrologer.isPinned ? (
          <button
            onClick={() => onUnpin(astrologer.astrologerId)}
            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            title="Unpin"
          >
            <Pin className="w-4 h-4 fill-current" />
          </button>
        ) : (
          <button
            onClick={() => onPin(astrologer.astrologerId)}
            className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            title="Pin to top"
          >
            <Pin className="w-4 h-4" />
          </button>
        )}
        {astrologer.isHidden ? (
          <button
            onClick={() => onUnhide(astrologer.astrologerId)}
            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Show"
          >
            <Eye className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => onHide(astrologer.astrologerId)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Hide from users"
          >
            <EyeOff className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

