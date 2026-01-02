import { call, put, takeLatest } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SagaIterator } from 'redux-saga';
import { adCentreApi } from '@/api/adCentre';
import {
  fetchBoostsRequest,
  fetchBoostsSuccess,
  fetchBoostsFailure,
  fetchBoostDetailsRequest,
  fetchBoostDetailsSuccess,
  fetchBoostDetailsFailure,
  approveBoostRequest,
  approveBoostSuccess,
  approveBoostFailure,
  rejectBoostRequest,
  rejectBoostSuccess,
  rejectBoostFailure,
  fetchStatisticsRequest,
  fetchStatisticsSuccess,
  fetchStatisticsFailure,
  createBoostRequest,
  createBoostSuccess,
  createBoostFailure,
  cancelBoostRequest,
  cancelBoostSuccess,
  cancelBoostFailure,
  triggerExpiryRequest,
  triggerExpirySuccess,
  triggerExpiryFailure,
} from '@/store/slices/adCentreSlice';
import type { BoostFilters } from '@/store/slices/adCentreSlice';

// Fetch Boosts Saga
function* fetchBoostsSaga(
  action: PayloadAction<{
    filters?: Partial<BoostFilters>;
    page?: number;
    limit?: number;
    sort?: string;
  }>
): SagaIterator {
  try {
    const response = yield call(adCentreApi.getAllBoosts, {
      status: action.payload.filters?.status !== 'all' ? action.payload.filters?.status : undefined,
      page: action.payload.page,
      limit: action.payload.limit,
      sort: action.payload.sort,
    });

    if (response.success && response.data) {
      yield put(
        fetchBoostsSuccess({
          boosts: response.data.boosts,
          pagination: response.data.pagination,
        })
      );
    } else {
      yield put(fetchBoostsFailure(response.message || 'Failed to fetch boosts'));
    }
  } catch (error: any) {
    yield put(fetchBoostsFailure(error.message || 'Failed to fetch boosts'));
  }
}

// Fetch Boost Details Saga
function* fetchBoostDetailsSaga(action: PayloadAction<string>): SagaIterator {
  try {
    const response = yield call(adCentreApi.getBoostDetails, action.payload);

    if (response.success && response.data) {
      const boostDetails = {
        ...response.data.boost,
        astrologer: response.data.astrologer,
      };
      yield put(fetchBoostDetailsSuccess(boostDetails));
    } else {
      yield put(fetchBoostDetailsFailure(response.message || 'Failed to fetch boost details'));
    }
  } catch (error: any) {
    yield put(fetchBoostDetailsFailure(error.message || 'Failed to fetch boost details'));
  }
}

// Approve Boost Saga
function* approveBoostSaga(action: PayloadAction<string>): SagaIterator {
  try {
    const response = yield call(adCentreApi.approveBoost, action.payload);

    if (response.success && response.data) {
      yield put(approveBoostSuccess(response.data));
      // Refresh boosts list and statistics
      yield put(fetchBoostsRequest({}));
      yield put(fetchStatisticsRequest());
    } else {
      yield put(approveBoostFailure(response.message || 'Failed to approve boost'));
    }
  } catch (error: any) {
    yield put(approveBoostFailure(error.message || 'Failed to approve boost'));
  }
}

// Reject Boost Saga
function* rejectBoostSaga(
  action: PayloadAction<{ boostId: string; reason?: string }>
): SagaIterator {
  try {
    const response = yield call(
      adCentreApi.rejectBoost,
      action.payload.boostId,
      action.payload.reason
    );

    if (response.success && response.data) {
      yield put(rejectBoostSuccess(response.data));
      // Refresh boosts list and statistics
      yield put(fetchBoostsRequest({}));
      yield put(fetchStatisticsRequest());
    } else {
      yield put(rejectBoostFailure(response.message || 'Failed to reject boost'));
    }
  } catch (error: any) {
    yield put(rejectBoostFailure(error.message || 'Failed to reject boost'));
  }
}

// Fetch Statistics Saga
function* fetchStatisticsSaga(): SagaIterator {
  try {
    const response = yield call(adCentreApi.getStatistics);

    if (response.success && response.data) {
      yield put(fetchStatisticsSuccess(response.data));
    } else {
      yield put(fetchStatisticsFailure(response.message || 'Failed to fetch statistics'));
    }
  } catch (error: any) {
    yield put(fetchStatisticsFailure(error.message || 'Failed to fetch statistics'));
  }
}

// Create Boost Saga
function* createBoostSaga(
  action: PayloadAction<{
    astrologerId: string;
    durationDays: number;
    startDate?: string;
  }>
): SagaIterator {
  try {
    const response = yield call(adCentreApi.createBoost, action.payload);

    if (response.success && response.data) {
      yield put(createBoostSuccess(response.data));
      // Refresh boosts list and statistics
      yield put(fetchBoostsRequest({}));
      yield put(fetchStatisticsRequest());
    } else {
      yield put(createBoostFailure(response.message || 'Failed to create boost'));
    }
  } catch (error: any) {
    yield put(createBoostFailure(error.message || 'Failed to create boost'));
  }
}

// Cancel Boost Saga
function* cancelBoostSaga(
  action: PayloadAction<{ boostId: string; reason: string }>
): SagaIterator {
  try {
    const response = yield call(
      adCentreApi.cancelBoost,
      action.payload.boostId,
      action.payload.reason
    );

    if (response.success && response.data) {
      yield put(cancelBoostSuccess(response.data));
      // Refresh boosts list and statistics
      yield put(fetchBoostsRequest({}));
      yield put(fetchStatisticsRequest());
    } else {
      yield put(cancelBoostFailure(response.message || 'Failed to cancel boost'));
    }
  } catch (error: any) {
    yield put(cancelBoostFailure(error.message || 'Failed to cancel boost'));
  }
}

// Trigger Expiry Saga
function* triggerExpirySaga(): SagaIterator {
  try {
    const response = yield call(adCentreApi.triggerExpiry);

    if (response.success && response.data) {
      yield put(triggerExpirySuccess());
      // Refresh boosts list and statistics
      yield put(fetchBoostsRequest({}));
      yield put(fetchStatisticsRequest());
      // Note: Toast notification should be handled in component via useEffect
    } else {
      yield put(triggerExpiryFailure(response.message || 'Failed to trigger expiry check'));
    }
  } catch (error: any) {
    yield put(triggerExpiryFailure(error.message || 'Failed to trigger expiry check'));
  }
}

// Root Ad Centre Saga
export function* adCentreSaga(): SagaIterator {
  yield takeLatest(fetchBoostsRequest.type, fetchBoostsSaga);
  yield takeLatest(fetchBoostDetailsRequest.type, fetchBoostDetailsSaga);
  yield takeLatest(approveBoostRequest.type, approveBoostSaga);
  yield takeLatest(rejectBoostRequest.type, rejectBoostSaga);
  yield takeLatest(fetchStatisticsRequest.type, fetchStatisticsSaga);
  yield takeLatest(createBoostRequest.type, createBoostSaga);
  yield takeLatest(cancelBoostRequest.type, cancelBoostSaga);
  yield takeLatest(triggerExpiryRequest.type, triggerExpirySaga);
}

