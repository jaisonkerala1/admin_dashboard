import React from 'react';
import { cn } from '@/utils/helpers';
import { PoojaRequest } from '@/types';
import { highlightText } from '@/utils/searchUtils';
import { MapPin } from 'lucide-react';

interface ServiceRequestSearchResultProps {
  request: PoojaRequest;
  isSelected: boolean;
  onClick: () => void;
  query: string;
}

export const ServiceRequestSearchResult: React.FC<ServiceRequestSearchResultProps> = ({ 
  request, 
  isSelected, 
  onClick, 
  query 
}) => {
  const requestId = request._id.slice(-8).toUpperCase();
  const astrologerName = request.astrologerId?.name || 'Unknown';

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left",
        isSelected ? "bg-primary-50 ring-2 ring-primary-500" : "hover:bg-gray-50"
      )}
    >
      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
        <MapPin className="w-5 h-5 text-purple-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm truncate">
          {highlightText(`#${requestId}`, query)}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {highlightText(request.serviceName, query)} • {highlightText(request.customerName, query)}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {request.customerPhone} • {request.status}
        </p>
      </div>
    </button>
  );
};

