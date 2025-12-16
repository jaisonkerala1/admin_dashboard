import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '@/api';
import { loginRequest, loginSuccess, loginFailure } from '../slices/authSlice';

// Worker saga: handles the login logic
function* loginSaga(action: PayloadAction<string>) {
  try {
    const adminKey = action.payload;
    
    // Call the login API
    const response: Awaited<ReturnType<typeof authApi.login>> = yield call(
      authApi.login,
      { adminKey }
    );
    
    if (response.success) {
      // Dispatch success action
      yield put(loginSuccess(adminKey));
    } else {
      // Dispatch failure action
      yield put(loginFailure(response.message || 'Invalid admin key'));
    }
  } catch (error: any) {
    // Handle errors
    const errorMessage = error.message || 'An error occurred during login';
    yield put(loginFailure(errorMessage));
  }
}

// Watcher saga: watches for login actions
function* authSaga() {
  yield takeLatest(loginRequest.type, loginSaga);
}

export default authSaga;
