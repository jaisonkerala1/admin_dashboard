import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { poojaRequestsApi } from '@/api/poojaRequests';
import {
  fetchRequestsRequest,
  fetchRequestsSuccess,
  fetchRequestsFailure,
  updateRequestRequest,
  updateRequestSuccess,
  updateRequestFailure,
} from '../slices/poojaRequestsSlice';

// Worker saga: fetches pooja requests
function* fetchRequestsSaga(action: PayloadAction<{ page: number; search?: string; status?: string }>) {
  try {
    const { page, search, status } = action.payload;
    
    const params: any = {
      page,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
    
    if (search) params.search = search;
    if (status) params.status = status;
    
    const response: Awaited<ReturnType<typeof poojaRequestsApi.getAll>> = yield call(
      poojaRequestsApi.getAll,
      params
    );
    
    if (response.success) {
      yield put(fetchRequestsSuccess({
        data: response.data,
        pagination: response.pagination,
      }));
    } else {
      yield put(fetchRequestsFailure('Failed to fetch pooja requests'));
    }
  } catch (error: any) {
    yield put(fetchRequestsFailure(error.message || 'An error occurred'));
  }
}

// Worker saga: updates a pooja request
function* updateRequestSaga(action: PayloadAction<{ id: string; data: any }>) {
  try {
    const { id, data } = action.payload;
    
    const response: Awaited<ReturnType<typeof poojaRequestsApi.update>> = yield call(
      poojaRequestsApi.update,
      id,
      data
    );
    
    if (response.success && response.data) {
      yield put(updateRequestSuccess(response.data));
    } else {
      yield put(updateRequestFailure('Failed to update pooja request'));
    }
  } catch (error: any) {
    yield put(updateRequestFailure(error.message || 'An error occurred'));
  }
}

// Watcher saga: watches for pooja request actions
function* poojaRequestsSaga() {
  yield takeLatest(fetchRequestsRequest.type, fetchRequestsSaga);
  yield takeLatest(updateRequestRequest.type, updateRequestSaga);
}

export default poojaRequestsSaga;


