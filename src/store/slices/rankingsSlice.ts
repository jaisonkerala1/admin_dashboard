import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  AstrologerRanking,
  RankingCategoryId,
  CategoryStats,
  BulkActionRequest,
} from '@/types';

interface RankingsState {
  categories: {
    top: AstrologerRanking[];
    experienced: AstrologerRanking[];
    popular: AstrologerRanking[];
    trending: AstrologerRanking[];
  };
  activeCategory: RankingCategoryId;
  isLoading: boolean;
  error: string | null;
  stats: Record<RankingCategoryId, CategoryStats | null>;
  hasUnsavedChanges: boolean;
  lastUpdated: Record<RankingCategoryId, string | null>;
}

const initialState: RankingsState = {
  categories: {
    top: [],
    experienced: [],
    popular: [],
    trending: [],
  },
  activeCategory: 'top',
  isLoading: false,
  error: null,
  stats: {
    top: null,
    experienced: null,
    popular: null,
    trending: null,
  },
  hasUnsavedChanges: false,
  lastUpdated: {
    top: null,
    experienced: null,
    popular: null,
    trending: null,
  },
};

const rankingsSlice = createSlice({
  name: 'rankings',
  initialState,
  reducers: {
    // Fetch rankings
    fetchRankingsRequest: (state, _action: PayloadAction<RankingCategoryId>) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchRankingsSuccess: (
      state,
      action: PayloadAction<{
        category: RankingCategoryId;
        rankings: AstrologerRanking[];
        stats: CategoryStats;
      }>
    ) => {
      state.isLoading = false;
      state.error = null;
      state.categories[action.payload.category] = action.payload.rankings;
      state.stats[action.payload.category] = action.payload.stats;
      state.lastUpdated[action.payload.category] = new Date().toISOString();
    },
    fetchRankingsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Reorder rankings
    reorderRankings: (
      state,
      action: PayloadAction<{
        category: RankingCategoryId;
        order: string[];
      }>
    ) => {
      const { category, order } = action.payload;
      const rankings = [...state.categories[category]];
      
      // Reorder based on provided order
      const reordered = order
        .map((id) => rankings.find((r) => r.astrologerId === id))
        .filter((r): r is AstrologerRanking => r !== undefined);
      
      // Add any rankings not in the order array at the end
      const remaining = rankings.filter((r) => !order.includes(r.astrologerId));
      state.categories[category] = [...reordered, ...remaining];
      state.hasUnsavedChanges = true;
    },

    // Pin astrologer
    pinAstrologer: (
      state,
      action: PayloadAction<{
        astrologerId: string;
        category: RankingCategoryId;
        position?: number;
      }>
    ) => {
      const { astrologerId, category, position } = action.payload;
      const rankings = state.categories[category];
      const index = rankings.findIndex((r) => r.astrologerId === astrologerId);
      
      if (index !== -1) {
        rankings[index].isPinned = true;
        rankings[index].pinnedPosition = position;
        state.hasUnsavedChanges = true;
      }
    },

    // Unpin astrologer
    unpinAstrologer: (
      state,
      action: PayloadAction<{
        astrologerId: string;
        category: RankingCategoryId;
      }>
    ) => {
      const { astrologerId, category } = action.payload;
      const rankings = state.categories[category];
      const index = rankings.findIndex((r) => r.astrologerId === astrologerId);
      
      if (index !== -1) {
        rankings[index].isPinned = false;
        rankings[index].pinnedPosition = undefined;
        state.hasUnsavedChanges = true;
      }
    },

    // Hide astrologer
    hideAstrologer: (
      state,
      action: PayloadAction<{
        astrologerId: string;
        category: RankingCategoryId;
      }>
    ) => {
      const { astrologerId, category } = action.payload;
      const rankings = state.categories[category];
      const index = rankings.findIndex((r) => r.astrologerId === astrologerId);
      
      if (index !== -1) {
        rankings[index].isHidden = true;
        state.hasUnsavedChanges = true;
      }
    },

    // Unhide astrologer
    unhideAstrologer: (
      state,
      action: PayloadAction<{
        astrologerId: string;
        category: RankingCategoryId;
      }>
    ) => {
      const { astrologerId, category } = action.payload;
      const rankings = state.categories[category];
      const index = rankings.findIndex((r) => r.astrologerId === astrologerId);
      
      if (index !== -1) {
        rankings[index].isHidden = false;
        state.hasUnsavedChanges = true;
      }
    },

    // Bulk actions
    bulkActionsRequest: (state, _action: PayloadAction<BulkActionRequest>) => {
      state.isLoading = true;
      state.error = null;
    },
    bulkActionsSuccess: (state) => {
      state.isLoading = false;
      state.hasUnsavedChanges = true;
    },
    bulkActionsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Set active category
    setActiveCategory: (state, action: PayloadAction<RankingCategoryId>) => {
      state.activeCategory = action.payload;
    },

    // Add astrologers to ranking
    addAstrologersRequest: (
      state,
      _action: PayloadAction<{
        astrologerIds: string[];
        category: RankingCategoryId;
      }>
    ) => {
      state.isLoading = true;
      state.error = null;
    },
    addAstrologersSuccess: (
      state,
      action: PayloadAction<{
        category: RankingCategoryId;
        rankings: AstrologerRanking[];
        stats: CategoryStats;
      }>
    ) => {
      state.isLoading = false;
      state.error = null;
      state.categories[action.payload.category] = action.payload.rankings;
      state.stats[action.payload.category] = action.payload.stats;
      state.lastUpdated[action.payload.category] = new Date().toISOString();
      state.hasUnsavedChanges = true;
    },
    addAstrologersFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Reset changes
    resetChanges: (state) => {
      state.hasUnsavedChanges = false;
    },
  },
});

export const {
  fetchRankingsRequest,
  fetchRankingsSuccess,
  fetchRankingsFailure,
  reorderRankings,
  pinAstrologer,
  unpinAstrologer,
  hideAstrologer,
  unhideAstrologer,
  bulkActionsRequest,
  bulkActionsSuccess,
  bulkActionsFailure,
  setActiveCategory,
  addAstrologersRequest,
  addAstrologersSuccess,
  addAstrologersFailure,
  resetChanges,
} = rankingsSlice.actions;

export default rankingsSlice.reducer;

