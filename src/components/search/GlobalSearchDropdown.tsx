import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, TrendingUp, User, FileText, Package, MapPin, ChevronRight, X } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  selectSearchQuery,
  selectSearchResults,
  selectIsSearching,
  selectShowDropdown,
  selectSelectedIndex,
  selectRecentSearches,
  selectTotalResultsCount,
  selectFlattenedResults,
} from '@/store/selectors/searchSelectors';
import {
  setShowDropdown,
  setSearchQuery,
  performSearchRequest,
  addRecentSearch,
  removeRecentSearch,
  resetSelection,
} from '@/store/slices/searchSlice';
import { SearchResultSkeleton } from './SearchResultSkeleton';
import { AstrologerSearchResult } from './results/AstrologerSearchResult';
import { ConsultationSearchResult } from './results/ConsultationSearchResult';
import { ServiceSearchResult } from './results/ServiceSearchResult';
import { ServiceRequestSearchResult } from './results/ServiceRequestSearchResult';

// Helper component
const CategoryHeader: React.FC<{ icon: React.ComponentType<{ className?: string }>; title: string; count: number }> = ({ 
  icon: Icon, 
  title, 
  count 
}) => (
  <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
    <Icon className="w-4 h-4" />
    {title}
    <span className="ml-auto text-gray-400">({count})</span>
  </div>
);

export const GlobalSearchDropdown: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const query = useAppSelector(selectSearchQuery);
  const results = useAppSelector(selectSearchResults);
  const isSearching = useAppSelector(selectIsSearching);
  const showDropdown = useAppSelector(selectShowDropdown);
  const selectedIndex = useAppSelector(selectSelectedIndex);
  const recentSearches = useAppSelector(selectRecentSearches);
  const totalResults = useAppSelector(selectTotalResultsCount);
  const flattenedResults = useAppSelector(selectFlattenedResults);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        dispatch(setShowDropdown(false));
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown, dispatch]);

  const handleRecentSearchClick = (searchQuery: string) => {
    dispatch(setSearchQuery(searchQuery));
    dispatch(performSearchRequest({ query: searchQuery, limit: 5 }));
  };

  const handleRemoveRecentSearch = (searchQuery: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(removeRecentSearch(searchQuery));
  };

  const handleViewAll = () => {
    if (query.trim()) {
      dispatch(addRecentSearch(query));
      navigate(`/search?q=${encodeURIComponent(query)}`);
      dispatch(setShowDropdown(false));
    }
  };

  const handleResultClick = (result: any) => {
    if (query.trim()) {
      dispatch(addRecentSearch(query));
    }
    dispatch(setShowDropdown(false));
    dispatch(resetSelection());
    
    // Navigate based on type
    const routes: Record<string, string> = {
      astrologer: `/astrologers/${result._id}`,
      consultation: `/consultations/${result._id}`,
      service: `/services/${result._id}`,
      serviceRequest: `/service-requests/${result._id}`,
    };
    
    if (routes[result.type]) {
      navigate(routes[result.type]);
    }
  };

  if (!showDropdown) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-slideDown"
      style={{ maxHeight: '70vh' }}
    >
      <div className="overflow-y-auto max-h-[calc(70vh-60px)]">
        {/* Loading State */}
        {isSearching && (
          <div className="p-4 space-y-3">
            <SearchResultSkeleton count={5} />
          </div>
        )}

        {/* No query - show recent searches */}
        {!query && !isSearching && recentSearches.length > 0 && (
          <div className="p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              <Clock className="w-4 h-4" />
              Recent Searches
            </div>
            {recentSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => handleRecentSearchClick(search)}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors text-left group"
              >
                <span className="text-sm text-gray-700">{search}</span>
                <X
                  className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleRemoveRecentSearch(search, e)}
                />
              </button>
            ))}
          </div>
        )}

        {/* Results */}
        {!isSearching && results && totalResults > 0 && (
          <div className="divide-y divide-gray-100">
            {/* Astrologers */}
            {results.astrologers.length > 0 && (
              <div className="p-4">
                <CategoryHeader icon={User} title="Astrologers" count={results.astrologers.length} />
                {results.astrologers.map((astrologer) => {
                  const flatIndex = flattenedResults.findIndex(r => r._id === astrologer._id && r.type === 'astrologer');
                  return (
                    <AstrologerSearchResult
                      key={astrologer._id}
                      astrologer={astrologer}
                      isSelected={flatIndex === selectedIndex}
                      onClick={() => handleResultClick({ ...astrologer, type: 'astrologer' })}
                      query={query}
                    />
                  );
                })}
              </div>
            )}

            {/* Consultations */}
            {results.consultations.length > 0 && (
              <div className="p-4">
                <CategoryHeader icon={FileText} title="Consultations" count={results.consultations.length} />
                {results.consultations.map((consultation) => {
                  const flatIndex = flattenedResults.findIndex(r => r._id === consultation._id && r.type === 'consultation');
                  return (
                    <ConsultationSearchResult
                      key={consultation._id}
                      consultation={consultation}
                      isSelected={flatIndex === selectedIndex}
                      onClick={() => handleResultClick({ ...consultation, type: 'consultation' })}
                      query={query}
                    />
                  );
                })}
              </div>
            )}

            {/* Services */}
            {results.services.length > 0 && (
              <div className="p-4">
                <CategoryHeader icon={Package} title="Services" count={results.services.length} />
                {results.services.map((service) => {
                  const flatIndex = flattenedResults.findIndex(r => r._id === service._id && r.type === 'service');
                  return (
                    <ServiceSearchResult
                      key={service._id}
                      service={service}
                      isSelected={flatIndex === selectedIndex}
                      onClick={() => handleResultClick({ ...service, type: 'service' })}
                      query={query}
                    />
                  );
                })}
              </div>
            )}

            {/* Service Requests */}
            {results.serviceRequests.length > 0 && (
              <div className="p-4">
                <CategoryHeader icon={MapPin} title="Service Requests" count={results.serviceRequests.length} />
                {results.serviceRequests.map((request) => {
                  const flatIndex = flattenedResults.findIndex(r => r._id === request._id && r.type === 'serviceRequest');
                  return (
                    <ServiceRequestSearchResult
                      key={request._id}
                      request={request}
                      isSelected={flatIndex === selectedIndex}
                      onClick={() => handleResultClick({ ...request, type: 'serviceRequest' })}
                      query={query}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* No Results */}
        {!isSearching && results && totalResults === 0 && query && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">No results found for "{query}"</p>
            <p className="text-sm text-gray-500 mt-1">Try different keywords or check spelling</p>
          </div>
        )}
      </div>

      {/* Footer - View All Results */}
      {!isSearching && results && totalResults > 0 && (
        <div className="border-t border-gray-100 p-3 bg-gray-50">
          <button
            onClick={handleViewAll}
            className="w-full flex items-center justify-between px-3 py-2 hover:bg-white rounded-lg transition-colors text-sm font-medium text-primary-600"
          >
            <span>View all {totalResults} results</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

