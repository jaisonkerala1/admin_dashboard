import React from 'react';
import { cn } from '@/utils/helpers';
import { RoundAvatar } from '@/components/common';
import { Astrologer } from '@/types';
import { highlightText } from '@/utils/searchUtils';

interface AstrologerSearchResultProps {
  astrologer: Astrologer;
  isSelected: boolean;
  onClick: () => void;
  query: string;
}

export const AstrologerSearchResult: React.FC<AstrologerSearchResultProps> = ({ 
  astrologer, 
  isSelected, 
  onClick, 
  query 
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left",
        isSelected ? "bg-primary-50 ring-2 ring-primary-500" : "hover:bg-gray-50"
      )}
    >
      <RoundAvatar 
        src={astrologer.profilePicture} 
        name={astrologer.name}
        isOnline={astrologer.isOnline}
        size="sm"
        className="flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm truncate">
          {highlightText(astrologer.name, query)}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {astrologer.phone}
          {astrologer.specialization?.[0] && ` • ${astrologer.specialization[0]}`}
        </p>
      </div>
      {astrologer.isOnline && (
        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
      )}
    </button>
  );
};

