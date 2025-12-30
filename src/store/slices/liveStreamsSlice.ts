import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LiveStream } from '@/types';

export type LiveStreamFilter = 'all' | 'live' | 'ended';

export interface LiveStreamsStats {
  total: number;
  live: number;
  ended: number;
  totalViews: number;
  totalLikes: number;
  peakViewers: number;
}

export interface LiveStreamsState {
  streams: LiveStream[];
  isLoading: boolean;
  error: string | null;
  filter: LiveStreamFilter;
  search: string;
  entriesPerPage: number;
  currentPage: number;
  selectedIds: Set<string>;
  stats: LiveStreamsStats;
}

const initialState: LiveStreamsState = {
  streams: [],
  isLoading: false,
  error: null,
  filter: 'all',
  search: '',
  entriesPerPage: 8,
  currentPage: 1,
  selectedIds: new Set(),
  stats: {
    total: 0,
    live: 0,
    ended: 0,
    totalViews: 0,
    totalLikes: 0,
    peakViewers: 0,
  },
};

const liveStreamsSlice = createSlice({
  name: 'liveStreams',
  initialState,
  reducers: {
    // Fetch streams
    fetchStreamsRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchStreamsSuccess: (state, action: PayloadAction<{ streams: LiveStream[]; stats: LiveStreamsStats }>) => {
      state.isLoading = false;
      state.streams = action.payload.streams;
      state.stats = action.payload.stats;
      state.error = null;
    },
    fetchStreamsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Filters and search
    setFilter: (state, action: PayloadAction<LiveStreamFilter>) => {
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

    // Real-time updates
    updateStreamStats: (state, action: PayloadAction<{ streamId: string; viewerCount?: number; likes?: number }>) => {
      const { streamId, viewerCount, likes } = action.payload;
      const stream = state.streams.find(s => s._id === streamId);
      if (stream) {
        if (viewerCount !== undefined) {
          stream.viewerCount = viewerCount;
          stream.peakViewerCount = Math.max(stream.peakViewerCount || 0, viewerCount);
        }
        if (likes !== undefined) {
          stream.likes = likes;
        }
      }
    },
    streamStarted: (state, action: PayloadAction<LiveStream>) => {
      if (!state.streams.find(s => s._id === action.payload._id)) {
        state.streams = [action.payload, ...state.streams];
        state.stats.live += 1;
        state.stats.total += 1;
      }
    },
    streamEnded: (state, action: PayloadAction<string>) => {
      const stream = state.streams.find(s => s._id === action.payload);
      if (stream && stream.isLive) {
        stream.isLive = false;
        stream.endedAt = new Date().toISOString();
        state.stats.live -= 1;
        state.stats.ended += 1;
      }
    },
  },
});

export const {
  fetchStreamsRequest,
  fetchStreamsSuccess,
  fetchStreamsFailure,
  setFilter,
  setSearch,
  setEntriesPerPage,
  setCurrentPage,
  setSelectedIds,
  selectAll,
  deselectAll,
  toggleSelection,
  updateStreamStats,
  streamStarted,
  streamEnded,
} = liveStreamsSlice.actions;

export default liveStreamsSlice.reducer;


