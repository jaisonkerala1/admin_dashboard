import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Review } from '@/types';

export type ReviewFilter = 'all' | 'verified' | 'unverified' | 'public' | 'hidden' | '5stars' | '4stars' | '3stars' | '2stars' | '1star';

export interface ReviewsStats {
  total: number;
  averageRating: number;
  verified: number;
  unverified: number;
  public: number;
  hidden: number;
  moderated: number;
  rating5: number;
  rating4: number;
  rating3: number;
  rating2: number;
  rating1: number;
}

export interface ReviewsState {
  reviews: Review[];
  isLoading: boolean;
  error: string | null;
  filter: ReviewFilter;
  search: string;
  entriesPerPage: number;
  currentPage: number;
  selectedIds: Set<string>;
  stats: ReviewsStats;
}

const initialState: ReviewsState = {
  reviews: [],
  isLoading: false,
  error: null,
  filter: 'all',
  search: '',
  entriesPerPage: 8,
  currentPage: 1,
  selectedIds: new Set(),
  stats: {
    total: 0,
    averageRating: 0,
    verified: 0,
    unverified: 0,
    public: 0,
    hidden: 0,
    moderated: 0,
    rating5: 0,
    rating4: 0,
    rating3: 0,
    rating2: 0,
    rating1: 0,
  },
};

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    // Fetch reviews
    fetchReviewsRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchReviewsSuccess: (state, action: PayloadAction<{ reviews: Review[]; stats: ReviewsStats }>) => {
      state.isLoading = false;
      state.reviews = action.payload.reviews;
      state.stats = action.payload.stats;
      state.error = null;
    },
    fetchReviewsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Filters and search
    setFilter: (state, action: PayloadAction<ReviewFilter>) => {
      state.filter = action.payload;
      state.currentPage = 1;
      state.selectedIds = new Set();
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      state.currentPage = 1;
    },
    setEntriesPerPage: (state, action: PayloadAction<number>) => {
      state.entriesPerPage = action.payload;
      state.currentPage = 1;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },

    // Selection
    setSelectedIds: (state, action: PayloadAction<Set<string>>) => {
      state.selectedIds = action.payload;
    },
    selectAll: (state, action: PayloadAction<string[]>) => {
      state.selectedIds = new Set(action.payload);
    },
    deselectAll: (state) => {
      state.selectedIds = new Set();
    },
    toggleSelection: (state, action: PayloadAction<string>) => {
      const newSet = new Set(state.selectedIds);
      if (newSet.has(action.payload)) {
        newSet.delete(action.payload);
      } else {
        newSet.add(action.payload);
      }
      state.selectedIds = newSet;
    },
  },
});

export const {
  fetchReviewsRequest,
  fetchReviewsSuccess,
  fetchReviewsFailure,
  setFilter,
  setSearch,
  setEntriesPerPage,
  setCurrentPage,
  setSelectedIds,
  selectAll,
  deselectAll,
  toggleSelection,
} = reviewsSlice.actions;

export default reviewsSlice.reducer;

