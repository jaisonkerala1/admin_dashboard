import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GlobalSearchResult } from '@/api/search';

export interface SearchState {
  query: string;
  results: GlobalSearchResult | null;
  isSearching: boolean;
  error: string | null;
  showDropdown: boolean;
  recentSearches: string[];
  totalResults: number;
  searchTime: number | null;
  selectedIndex: number; // For keyboard navigation
  // Full search page state
  currentPage: number;
  entriesPerPage: number;
  activeCategory: 'all' | 'astrologers' | 'consultations' | 'services' | 'serviceRequests';
}

const initialState: SearchState = {
  query: '',
  results: null,
  isSearching: false,
  error: null,
  showDropdown: false,
  recentSearches: [],
  totalResults: 0,
  searchTime: null,
  selectedIndex: -1,
  currentPage: 1,
  entriesPerPage: 10,
  activeCategory: 'all',
};

// Helper function
function calculateTotalResults(results: GlobalSearchResult): number {
  return (
    results.astrologers.length +
    results.consultations.length +
    results.services.length +
    results.serviceRequests.length
  );
}

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    // Search actions
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
      state.selectedIndex = -1; // Reset selection
      if (!action.payload) {
        state.showDropdown = false;
        state.results = null;
      }
    },
    
    performSearchRequest: (state, action: PayloadAction<{ query: string; limit?: number }>) => {
      state.isSearching = true;
      state.error = null;
    },
    
    performSearchSuccess: (state, action: PayloadAction<{ 
      results: GlobalSearchResult; 
      totalResults: number; 
      searchTime?: number;
    }>) => {
      state.isSearching = false;
      state.results = action.payload.results;
      state.totalResults = action.payload.totalResults;
      state.searchTime = action.payload.searchTime || null;
      state.showDropdown = true;
      state.error = null;
      
      // Update recent searches from response if available
      if (action.payload.results.recentSearches) {
        state.recentSearches = action.payload.results.recentSearches;
      }
    },
    
    performSearchFailure: (state, action: PayloadAction<string>) => {
      state.isSearching = false;
      state.error = action.payload;
      state.showDropdown = false;
    },
    
    // Dropdown control
    setShowDropdown: (state, action: PayloadAction<boolean>) => {
      state.showDropdown = action.payload;
    },
    
    // Keyboard navigation
    selectNextResult: (state) => {
      if (!state.results) return;
      const total = calculateTotalResults(state.results);
      state.selectedIndex = Math.min(state.selectedIndex + 1, total - 1);
    },
    
    selectPreviousResult: (state) => {
      state.selectedIndex = Math.max(state.selectedIndex - 1, -1);
    },
    
    resetSelection: (state) => {
      state.selectedIndex = -1;
    },
    
    // Recent searches
    addRecentSearch: (state, action: PayloadAction<string>) => {
      const query = action.payload.trim();
      if (!query || state.recentSearches.includes(query)) return;
      state.recentSearches = [query, ...state.recentSearches.slice(0, 9)]; // Keep last 10
    },
    
    removeRecentSearch: (state, action: PayloadAction<string>) => {
      state.recentSearches = state.recentSearches.filter(q => q !== action.payload);
    },
    
    clearRecentSearches: (state) => {
      state.recentSearches = [];
    },
    
    // Full search page
    setActiveCategory: (state, action: PayloadAction<SearchState['activeCategory']>) => {
      state.activeCategory = action.payload;
      state.currentPage = 1;
    },
    
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    
    setEntriesPerPage: (state, action: PayloadAction<number>) => {
      state.entriesPerPage = action.payload;
      state.currentPage = 1;
    },
    
    // Clear search
    clearSearch: (state) => {
      state.query = '';
      state.results = null;
      state.showDropdown = false;
      state.selectedIndex = -1;
      state.error = null;
    },
  },
});

export const {
  setSearchQuery,
  performSearchRequest,
  performSearchSuccess,
  performSearchFailure,
  setShowDropdown,
  selectNextResult,
  selectPreviousResult,
  resetSelection,
  addRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
  setActiveCategory,
  setCurrentPage,
  setEntriesPerPage,
  clearSearch,
} = searchSlice.actions;

export default searchSlice.reducer;

