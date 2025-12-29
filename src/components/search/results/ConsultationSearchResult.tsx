import React from 'react';
import { cn } from '@/utils/helpers';
import { Consultation } from '@/types';
import { highlightText } from '@/utils/searchUtils';
import { FileText } from 'lucide-react';

interface ConsultationSearchResultProps {
  consultation: Consultation;
  isSelected: boolean;
  onClick: () => void;
  query: string;
}

export const ConsultationSearchResult: React.FC<ConsultationSearchResultProps> = ({ 
  consultation, 
  isSelected, 
  onClick, 
  query 
}) => {
  const consultationId = consultation._id.slice(-8).toUpperCase();
  const astrologerName = consultation.astrologerId?.name || 'Unknown';
  const clientName = consultation.clientName || 'Unknown';

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left",
        isSelected ? "bg-primary-50 ring-2 ring-primary-500" : "hover:bg-gray-50"
      )}
    >
      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
        <FileText className="w-5 h-5 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm truncate">
          {highlightText(`#${consultationId}`, query)}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {highlightText(clientName, query)} • {highlightText(astrologerName, query)}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {consultation.status} • {consultation.type}
        </p>
      </div>
    </button>
  );
};

