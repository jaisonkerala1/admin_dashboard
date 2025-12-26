import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';

export interface SearchBarProps {
  /** Search query value */
  value?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Callback when search query changes (debounced) */
  onSearch: (query: string) => void;
  /** Callback when search is cleared */
  onClear?: () => void;
  /** Debounce delay in milliseconds (default: 500) */
  debounceMs?: number;
  /** Custom className */
  className?: string;
}

/**
 * Minimal rounded searchbar component
 * Matches Flutter app discussion module design
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  value: controlledValue,
  placeholder = 'Search...',
  onSearch,
  onClear,
  debounceMs = 500,
  className = '',
}) => {
  const [localValue, setLocalValue] = useState('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isControlled = controlledValue !== undefined;

  const currentValue = isControlled ? controlledValue : localValue;

  // Debounced search handler
  const handleSearch = useCallback(
    (query: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        onSearch(query);
      }, debounceMs);
    },
    [onSearch, debounceMs]
  );

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // For controlled components, we need parent to update immediately
    // So we call onSearch immediately, but parent can debounce if needed
    if (isControlled) {
      // In controlled mode, call onSearch immediately so parent updates value
      // Parent will handle debouncing the actual search operation
      onSearch(newValue);
    } else {
      // Update local state immediately for UI responsiveness
      setLocalValue(newValue);
      // Debounced search callback
      handleSearch(newValue);
    }
  };

  // Handle clear
  const handleClear = () => {
    if (!isControlled) {
      setLocalValue('');
    }
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    onSearch('');
    onClear?.();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const hasValue = currentValue.length > 0;

  return (
    <div className={`relative ${className}`}>
      <div className="relative h-[54px] bg-white rounded-full border border-gray-200/50 shadow-sm transition-all duration-200 hover:shadow-md focus-within:shadow-md focus-within:border-gray-300">
        {/* Search Icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <Search
            className={`w-5 h-5 transition-colors ${
              hasValue ? 'text-gray-700' : 'text-gray-400'
            }`}
          />
        </div>

        {/* Input */}
        <input
          type="text"
          value={currentValue}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full h-full pl-12 pr-12 bg-transparent rounded-full text-gray-900 placeholder:text-gray-400 text-[15px] font-medium focus:outline-none focus:ring-0"
        />

        {/* Clear Button */}
        {hasValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>
    </div>
  );
};

