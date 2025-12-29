import React from 'react';
import { cn } from '@/utils/helpers';
import { Service } from '@/types';
import { highlightText } from '@/utils/searchUtils';
import { Package } from 'lucide-react';

interface ServiceSearchResultProps {
  service: Service;
  isSelected: boolean;
  onClick: () => void;
  query: string;
}

export const ServiceSearchResult: React.FC<ServiceSearchResultProps> = ({ 
  service, 
  isSelected, 
  onClick, 
  query 
}) => {
  const astrologerName = service.astrologerId?.name || 'Unknown';

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left",
        isSelected ? "bg-primary-50 ring-2 ring-primary-500" : "hover:bg-gray-50"
      )}
    >
      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
        <Package className="w-5 h-5 text-orange-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm truncate">
          {highlightText(service.name, query)}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {highlightText(astrologerName, query)} • {service.category}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          ₹{service.price} • {service.duration}
        </p>
      </div>
    </button>
  );
};

