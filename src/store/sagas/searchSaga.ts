import { call, put, takeLatest, debounce } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import { PayloadAction } from '@reduxjs/toolkit';
import { searchApi, SearchResponse } from '@/api/search';
import {
  performSearchRequest,
  performSearchSuccess,
  performSearchFailure,
  addRecentSearch,
} from '../slices/searchSlice';

// Debounced search saga
function* performSearchSaga(action: PayloadAction<{ query: string; limit?: number }>): SagaIterator {
  const { query, limit = 5 } = action.payload;
  
  // Don't search for empty or very short queries
  if (!query || query.trim().length < 2) {
    return;
  }

  try {
    const response: SearchResponse = yield call(searchApi.globalSearch, query.trim(), limit);
    
    yield put(performSearchSuccess({
      results: response.data,
      totalResults: response.totalResults,
      searchTime: response.searchTime,
    }));
    
  } catch (error: any) {
    console.error('Search failed:', error);
    yield put(performSearchFailure(error?.message || 'Search failed'));
  }
}

// Save recent search saga
function* saveRecentSearchSaga(action: PayloadAction<string>): SagaIterator {
  try {
    yield call(searchApi.saveRecentSearch, action.payload);
  } catch (error) {
    console.error('Failed to save recent search:', error);
    // Don't fail the action if saving recent search fails
  }
}

// Clear recent searches saga
function* clearRecentSearchesSaga(): SagaIterator {
  try {
    yield call(searchApi.clearRecentSearches);
  } catch (error) {
    console.error('Failed to clear recent searches:', error);
  }
}

export default function* searchSaga(): SagaIterator {
  // Debounce search by 300ms
  yield debounce(300, performSearchRequest.type, performSearchSaga);
  
  // Save recent searches
  yield takeLatest(addRecentSearch.type, saveRecentSearchSaga);
  
  // Clear recent searches
  yield takeLatest('search/clearRecentSearches', clearRecentSearchesSaga);
}

