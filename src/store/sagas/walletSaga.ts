import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { walletApi } from '@/api/wallet';
import { WalletApiResponse, WalletPeriod } from '@/types/wallet';
import {
  fetchWalletDataRequest,
  fetchWalletDataSuccess,
  fetchWalletDataFailure,
} from '@/store/slices/walletSlice';

function* fetchWalletDataSaga(action: PayloadAction<{ period: WalletPeriod }>) {
  try {
    const response: WalletApiResponse = yield call(
      walletApi.getWalletData,
      action.payload.period
    );

    if (response.success && response.data) {
      yield put(fetchWalletDataSuccess(response.data));
    } else {
      yield put(fetchWalletDataFailure('Failed to fetch wallet data'));
    }
  } catch (error: any) {
    console.error('❌ Wallet Saga Error:', error);
    yield put(fetchWalletDataFailure(error.message || 'Unknown error'));
  }
}

export function* walletSaga() {
  yield takeLatest(fetchWalletDataRequest.type, fetchWalletDataSaga);
}

