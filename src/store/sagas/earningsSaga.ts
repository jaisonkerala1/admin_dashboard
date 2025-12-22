import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { earningsApi } from '@/api/earnings';
import { EarningsApiResponse, EarningsPeriod } from '@/types/earnings';
import {
  fetchEarningsRequest,
  fetchEarningsSuccess,
  fetchEarningsFailure,
} from '@/store/slices/earningsSlice';

function* fetchEarningsSaga(action: PayloadAction<{ period: EarningsPeriod }>) {
  try {
    const response: EarningsApiResponse = yield call(
      earningsApi.getEarnings,
      action.payload.period
    );

    if (response.success && response.data) {
      yield put(fetchEarningsSuccess(response.data));
    } else {
      yield put(fetchEarningsFailure('Failed to fetch earnings data'));
    }
  } catch (error: any) {
    console.error('❌ Earnings Saga Error:', error);
    yield put(fetchEarningsFailure(error.message || 'Unknown error'));
  }
}

export function* earningsSaga() {
  yield takeLatest(fetchEarningsRequest.type, fetchEarningsSaga);
}

