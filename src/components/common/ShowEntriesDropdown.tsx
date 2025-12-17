import React from 'react';
import { ChevronDown } from 'lucide-react';

interface ShowEntriesDropdownProps {
  value: number;
  onChange: (value: number) => void;
  options?: number[];
  className?: string;
}

export const ShowEntriesDropdown: React.FC<ShowEntriesDropdownProps> = ({
  value,
  onChange,
  options = [8, 15, 25, 50],
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-gray-600">Show</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-1.5 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer transition-colors"
        >
          {options.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
      </div>
      <span className="text-sm text-gray-600">entries</span>
    </div>
  );
};



