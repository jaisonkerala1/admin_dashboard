import { call, put, takeLatest } from 'redux-saga/effects';
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
  addAstrologersFailure,
} from '../slices/rankingsSlice';
import { RankingCategoryId, BulkActionRequest } from '@/types';

// Fetch rankings saga
function* fetchRankingsSaga(action: PayloadAction<RankingCategoryId>): SagaIterator {
  try {
    const category = action.payload;
    const response = yield call(rankingsApi.getRankings, category, {
      includeHidden: true,
      limit: 50,
      recalculate: false,
      includeAll: false,
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

    // Call API
    const response = yield call(rankingsApi.reorderRankings, category, order);

    if (!response.success) {
      yield put(fetchRankingsFailure(response.message || 'Failed to reorder rankings'));
      yield put(fetchRankingsRequest(category));
      return;
    }

    // Refetch to reflect server truth (pinned positions / final list)
    yield put(fetchRankingsRequest(category));
  } catch (error: any) {
    yield put(fetchRankingsFailure(error.message || 'Failed to reorder rankings'));
    yield put(fetchRankingsRequest(action.payload.category));
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

    const response = yield call(rankingsApi.pinAstrologer, astrologerId, category, position);

    if (!response.success) {
      yield put(fetchRankingsFailure(response.message || 'Failed to pin astrologer'));
      yield put(fetchRankingsRequest(category));
      return;
    }

    yield put(fetchRankingsRequest(category));
  } catch (error: any) {
    yield put(fetchRankingsFailure(error.message || 'Failed to pin astrologer'));
    yield put(fetchRankingsRequest(action.payload.category));
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

    const response = yield call(rankingsApi.unpinAstrologer, astrologerId, category);

    if (!response.success) {
      yield put(fetchRankingsFailure(response.message || 'Failed to unpin astrologer'));
      yield put(fetchRankingsRequest(category));
      return;
    }

    yield put(fetchRankingsRequest(category));
  } catch (error: any) {
    yield put(fetchRankingsFailure(error.message || 'Failed to unpin astrologer'));
    yield put(fetchRankingsRequest(action.payload.category));
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

    const response = yield call(rankingsApi.hideAstrologer, astrologerId, category);

    if (!response.success) {
      yield put(fetchRankingsFailure(response.message || 'Failed to hide astrologer'));
      yield put(fetchRankingsRequest(category));
      return;
    }

    yield put(fetchRankingsRequest(category));
  } catch (error: any) {
    yield put(fetchRankingsFailure(error.message || 'Failed to hide astrologer'));
    yield put(fetchRankingsRequest(action.payload.category));
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

    const response = yield call(rankingsApi.unhideAstrologer, astrologerId, category);

    if (!response.success) {
      yield put(fetchRankingsFailure(response.message || 'Failed to unhide astrologer'));
      yield put(fetchRankingsRequest(category));
      return;
    }

    yield put(fetchRankingsRequest(category));
  } catch (error: any) {
    yield put(fetchRankingsFailure(error.message || 'Failed to unhide astrologer'));
    yield put(fetchRankingsRequest(action.payload.category));
  }
}

// Bulk actions saga
function* bulkActionsSaga(action: PayloadAction<BulkActionRequest>): SagaIterator {
  try {
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

