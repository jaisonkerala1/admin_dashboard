import { call, put, takeLatest } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SagaIterator } from 'redux-saga';
import { communicationApi } from '@/api';
import type { CommunicationPeriod } from '@/types/communication';
import {
  fetchStatsRequest,
  fetchStatsSuccess,
  fetchStatsFailure,
  fetchTrendsRequest,
  fetchTrendsSuccess,
  fetchTrendsFailure,
  fetchAstrologerStatsRequest,
  fetchAstrologerStatsSuccess,
  fetchAstrologerStatsFailure,
  fetchCallDurationStatsRequest,
  fetchCallDurationStatsSuccess,
  fetchCallDurationStatsFailure,
  fetchPeakHoursRequest,
  fetchPeakHoursSuccess,
  fetchPeakHoursFailure,
  fetchSuccessRateTrendsRequest,
  fetchSuccessRateTrendsSuccess,
  fetchSuccessRateTrendsFailure,
} from '@/store/slices/communicationSlice';

// Fetch Stats Saga
function* fetchStatsSaga(action: PayloadAction<{ period: CommunicationPeriod }>): SagaIterator {
  try {
    const response = yield call(communicationApi.getCommunicationStats, action.payload.period);
    
    if (response.success && response.data) {
      yield put(fetchStatsSuccess(response.data));
    } else {
      yield put(fetchStatsFailure(response.message || 'Failed to fetch communication stats'));
    }
  } catch (error: any) {
    yield put(fetchStatsFailure(error.message || 'Failed to fetch communication stats'));
  }
}

// Fetch Trends Saga
function* fetchTrendsSaga(action: PayloadAction<{ period: CommunicationPeriod }>): SagaIterator {
  try {
    const response = yield call(communicationApi.getCommunicationTrends, action.payload.period);
    
    if (response.success && response.data) {
      yield put(fetchTrendsSuccess(response.data));
    } else {
      yield put(fetchTrendsFailure(response.message || 'Failed to fetch communication trends'));
    }
  } catch (error: any) {
    yield put(fetchTrendsFailure(error.message || 'Failed to fetch communication trends'));
  }
}

// Fetch Astrologer Stats Saga
function* fetchAstrologerStatsSaga(action: PayloadAction<{ period: CommunicationPeriod }>): SagaIterator {
  try {
    const response = yield call(communicationApi.getAstrologerCommunicationStats, action.payload.period);
    
    if (response.success && response.data) {
      yield put(fetchAstrologerStatsSuccess(response.data));
    } else {
      yield put(fetchAstrologerStatsFailure(response.message || 'Failed to fetch astrologer stats'));
    }
  } catch (error: any) {
    yield put(fetchAstrologerStatsFailure(error.message || 'Failed to fetch astrologer stats'));
  }
}

// Fetch Call Duration Stats Saga
function* fetchCallDurationStatsSaga(action: PayloadAction<{ period: CommunicationPeriod }>): SagaIterator {
  try {
    const response = yield call(communicationApi.getCallDurationStats, action.payload.period);
    
    if (response.success && response.data) {
      yield put(fetchCallDurationStatsSuccess(response.data));
    } else {
      yield put(fetchCallDurationStatsFailure(response.message || 'Failed to fetch call duration stats'));
    }
  } catch (error: any) {
    yield put(fetchCallDurationStatsFailure(error.message || 'Failed to fetch call duration stats'));
  }
}

// Fetch Peak Hours Saga
function* fetchPeakHoursSaga(action: PayloadAction<{ period: CommunicationPeriod }>): SagaIterator {
  try {
    const response = yield call(communicationApi.getPeakHours, action.payload.period);
    
    if (response.success && response.data) {
      yield put(fetchPeakHoursSuccess(response.data));
    } else {
      yield put(fetchPeakHoursFailure(response.message || 'Failed to fetch peak hours'));
    }
  } catch (error: any) {
    yield put(fetchPeakHoursFailure(error.message || 'Failed to fetch peak hours'));
  }
}

// Fetch Success Rate Trends Saga
function* fetchSuccessRateTrendsSaga(action: PayloadAction<{ period: CommunicationPeriod }>): SagaIterator {
  try {
    const response = yield call(communicationApi.getCallSuccessRateTrends, action.payload.period);
    
    if (response.success && response.data) {
      yield put(fetchSuccessRateTrendsSuccess(response.data));
    } else {
      yield put(fetchSuccessRateTrendsFailure(response.message || 'Failed to fetch success rate trends'));
    }
  } catch (error: any) {
    yield put(fetchSuccessRateTrendsFailure(error.message || 'Failed to fetch success rate trends'));
  }
}

// Root Communication Saga
export function* communicationSaga(): SagaIterator {
  yield takeLatest(fetchStatsRequest.type, fetchStatsSaga);
  yield takeLatest(fetchTrendsRequest.type, fetchTrendsSaga);
  yield takeLatest(fetchAstrologerStatsRequest.type, fetchAstrologerStatsSaga);
  yield takeLatest(fetchCallDurationStatsRequest.type, fetchCallDurationStatsSaga);
  yield takeLatest(fetchPeakHoursRequest.type, fetchPeakHoursSaga);
  yield takeLatest(fetchSuccessRateTrendsRequest.type, fetchSuccessRateTrendsSaga);
}

