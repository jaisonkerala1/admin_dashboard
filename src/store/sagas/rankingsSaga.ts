import { call, put, takeLatest, select } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { SagaIterator } from 'redux-saga';
import { rankingsApi } from '@/api';
import {
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
  addAstrologersRequest,
  addAstrologersSuccess,
  addAstrologersFailure,
} from '../slices/rankingsSlice';
import { RankingCategoryId, BulkActionRequest } from '@/types';
import { RootState } from '../index';

// Fetch rankings saga
function* fetchRankingsSaga(action: PayloadAction<RankingCategoryId>): SagaIterator {
  try {
    const category = action.payload;
    const response = yield call(rankingsApi.getRankings, category, {
      includeHidden: true,
      recalculate: false,
    });

    if (response.success) {
      yield put(
        fetchRankingsSuccess({
          category,
          rankings: response.data || [],
          stats: response.stats,
        })
      );
    } else {
      yield put(fetchRankingsFailure(response.message || 'Failed to fetch rankings'));
    }
  } catch (error: any) {
    yield put(fetchRankingsFailure(error.message || 'Failed to fetch rankings'));
  }
}

// Reorder rankings saga
function* reorderRankingsSaga(
  action: PayloadAction<{ category: RankingCategoryId; order: string[] }>
): SagaIterator {
  try {
    const { category, order } = action.payload;
    
    // Optimistic update
    yield put(reorderRankings({ category, order }));

    // Call API
    const response = yield call(rankingsApi.reorderRankings, category, order);

    if (!response.success) {
      // Revert on failure - refetch rankings
      yield put(fetchRankingsRequest(category));
      yield put(fetchRankingsFailure(response.message || 'Failed to reorder rankings'));
    }
  } catch (error: any) {
    // Revert on error - refetch rankings
    const state: RootState = yield select();
    const category = state.rankings.activeCategory;
    yield put(fetchRankingsRequest(category));
    yield put(fetchRankingsFailure(error.message || 'Failed to reorder rankings'));
  }
}

// Pin astrologer saga
function* pinAstrologerSaga(
  action: PayloadAction<{
    astrologerId: string;
    category: RankingCategoryId;
    position?: number;
  }>
): SagaIterator {
  try {
    const { astrologerId, category, position } = action.payload;
    
    // Optimistic update
    yield put(pinAstrologer({ astrologerId, category, position }));

    const response = yield call(rankingsApi.pinAstrologer, astrologerId, category, position);

    if (!response.success) {
      // Revert on failure
      yield put(unpinAstrologer({ astrologerId, category }));
      yield put(fetchRankingsFailure(response.message || 'Failed to pin astrologer'));
    }
  } catch (error: any) {
    // Revert on error
    const { astrologerId, category } = action.payload;
    yield put(unpinAstrologer({ astrologerId, category }));
    yield put(fetchRankingsFailure(error.message || 'Failed to pin astrologer'));
  }
}

// Unpin astrologer saga
function* unpinAstrologerSaga(
  action: PayloadAction<{
    astrologerId: string;
    category: RankingCategoryId;
  }>
): SagaIterator {
  try {
    const { astrologerId, category } = action.payload;
    
    // Optimistic update
    yield put(unpinAstrologer({ astrologerId, category }));

    const response = yield call(rankingsApi.unpinAstrologer, astrologerId, category);

    if (!response.success) {
      // Revert on failure - refetch
      yield put(fetchRankingsRequest(category));
      yield put(fetchRankingsFailure(response.message || 'Failed to unpin astrologer'));
    }
  } catch (error: any) {
    // Revert on error - refetch
    const { category } = action.payload;
    yield put(fetchRankingsRequest(category));
    yield put(fetchRankingsFailure(error.message || 'Failed to unpin astrologer'));
  }
}

// Hide astrologer saga
function* hideAstrologerSaga(
  action: PayloadAction<{
    astrologerId: string;
    category: RankingCategoryId;
  }>
): SagaIterator {
  try {
    const { astrologerId, category } = action.payload;
    
    // Optimistic update
    yield put(hideAstrologer({ astrologerId, category }));

    const response = yield call(rankingsApi.hideAstrologer, astrologerId, category);

    if (!response.success) {
      // Revert on failure
      yield put(unhideAstrologer({ astrologerId, category }));
      yield put(fetchRankingsFailure(response.message || 'Failed to hide astrologer'));
    }
  } catch (error: any) {
    // Revert on error
    const { astrologerId, category } = action.payload;
    yield put(unhideAstrologer({ astrologerId, category }));
    yield put(fetchRankingsFailure(error.message || 'Failed to hide astrologer'));
  }
}

// Unhide astrologer saga
function* unhideAstrologerSaga(
  action: PayloadAction<{
    astrologerId: string;
    category: RankingCategoryId;
  }>
): SagaIterator {
  try {
    const { astrologerId, category } = action.payload;
    
    // Optimistic update
    yield put(unhideAstrologer({ astrologerId, category }));

    const response = yield call(rankingsApi.unhideAstrologer, astrologerId, category);

    if (!response.success) {
      // Revert on failure - refetch
      yield put(fetchRankingsRequest(category));
      yield put(fetchRankingsFailure(response.message || 'Failed to unhide astrologer'));
    }
  } catch (error: any) {
    // Revert on error - refetch
    const { category } = action.payload;
    yield put(fetchRankingsRequest(category));
    yield put(fetchRankingsFailure(error.message || 'Failed to unhide astrologer'));
  }
}

// Bulk actions saga
function* bulkActionsSaga(action: PayloadAction<BulkActionRequest>): SagaIterator {
  try {
    yield put(bulkActionsRequest(action.payload));

    const response = yield call(rankingsApi.bulkActions, action.payload);

    if (response.success) {
      yield put(bulkActionsSuccess());
      // Refetch rankings to get updated data
      yield put(fetchRankingsRequest(action.payload.category));
    } else {
      yield put(bulkActionsFailure(response.message || 'Failed to perform bulk action'));
    }
  } catch (error: any) {
    yield put(bulkActionsFailure(error.message || 'Failed to perform bulk action'));
  }
}

// Add astrologers saga
function* addAstrologersSaga(
  action: PayloadAction<{
    astrologerIds: string[];
    category: RankingCategoryId;
  }>
): SagaIterator {
  try {
    const { astrologerIds, category } = action.payload;
    const response = yield call(rankingsApi.addAstrologers, category, astrologerIds);

    if (response.success) {
      // Refetch rankings to get the latest data with all astrologers
      yield put(fetchRankingsRequest(category));
    } else {
      yield put(addAstrologersFailure(response.message || 'Failed to add astrologers'));
    }
  } catch (error: any) {
    console.error('Add astrologers error:', error);
    yield put(addAstrologersFailure(error.message || 'Failed to add astrologers'));
  }
}

// Watcher saga
export default function* rankingsSaga(): SagaIterator {
  yield takeLatest(fetchRankingsRequest.type, fetchRankingsSaga);
  yield takeLatest(reorderRankings.type, reorderRankingsSaga);
  yield takeLatest(pinAstrologer.type, pinAstrologerSaga);
  yield takeLatest(unpinAstrologer.type, unpinAstrologerSaga);
  yield takeLatest(hideAstrologer.type, hideAstrologerSaga);
  yield takeLatest(unhideAstrologer.type, unhideAstrologerSaga);
  yield takeLatest(bulkActionsRequest.type, bulkActionsSaga);
  yield takeLatest(addAstrologersRequest.type, addAstrologersSaga);
}

