import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Review } from '@/types';

export type ReviewFilter = 'all' | 'needsReply' | 'pendingModeration' | 'public' | 'hidden' | 'negative' | 'adminCreated';

export interface ReviewsStats {
  total: number;
  averageRating: number;
  needsReply: number;
  pendingModeration: number;
  public: number;
  hidden: number;
  negative: number;
  adminCreated: number;
}

export interface ReviewsState {
  reviews: Review[];
  isLoading: boolean;
  error: string | null;
  filter: ReviewFilter;
  search: string;
  entriesPerPage: number;
  currentPage: number;
  totalPages: number;
  selectedIds: string[];
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
  totalPages: 1,
  selectedIds: [],
  stats: {
    total: 0,
    averageRating: 0,
    needsReply: 0,
    pendingModeration: 0,
    public: 0,
    hidden: 0,
    negative: 0,
    adminCreated: 0,
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
    fetchReviewsSuccess: (state, action: PayloadAction<{ reviews: Review[]; stats: ReviewsStats; totalPages: number }>) => {
      state.isLoading = false;
      state.reviews = action.payload.reviews;
      state.stats = action.payload.stats;
      state.totalPages = action.payload.totalPages;
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
      state.selectedIds = [];
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
    setSelectedIds: (state, action: PayloadAction<string[]>) => {
      state.selectedIds = action.payload;
    },
    selectAll: (state, action: PayloadAction<string[]>) => {
      state.selectedIds = action.payload;
    },
    deselectAll: (state) => {
      state.selectedIds = [];
    },
    toggleSelection: (state, action: PayloadAction<string>) => {
      const index = state.selectedIds.indexOf(action.payload);
      if (index !== -1) {
        state.selectedIds.splice(index, 1);
      } else {
        state.selectedIds.push(action.payload);
      }
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


