import { RootState } from '@/store';
import { createSelector } from '@reduxjs/toolkit';

export const selectSearchState = (state: RootState) => state.search;
export const selectSearchQuery = (state: RootState) => state.search.query;
export const selectSearchResults = (state: RootState) => state.search.results;
export const selectIsSearching = (state: RootState) => state.search.isSearching;
export const selectShowDropdown = (state: RootState) => state.search.showDropdown;
export const selectSelectedIndex = (state: RootState) => state.search.selectedIndex;
export const selectRecentSearches = (state: RootState) => state.search.recentSearches;

// Memoized selectors
export const selectTotalResultsCount = createSelector(
  [selectSearchResults],
  (results) => {
    if (!results) return 0;
    return (
      results.astrologers.length +
      results.consultations.length +
      results.services.length +
      results.serviceRequests.length
    );
  }
);

export const selectHasResults = createSelector(
  [selectTotalResultsCount],
  (count) => count > 0
);

export const selectFlattenedResults = createSelector(
  [selectSearchResults],
  (results) => {
    if (!results) return [];
    
    return [
      ...results.astrologers.map(item => ({ ...item, type: 'astrologer' as const })),
      ...results.consultations.map(item => ({ ...item, type: 'consultation' as const })),
      ...results.services.map(item => ({ ...item, type: 'service' as const })),
      ...results.serviceRequests.map(item => ({ ...item, type: 'serviceRequest' as const })),
    ];
  }
);

export const selectSelectedResult = createSelector(
  [selectFlattenedResults, selectSelectedIndex],
  (results, index) => {
    if (index < 0 || index >= results.length) return null;
    return results[index];
  }
);

