import { call, put, takeLatest, SagaIterator } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { poojaRequestsApi } from '@/api/poojaRequests';
import { PoojaRequest } from '@/types';
import {
  fetchRequestsRequest,
  fetchRequestsSuccess,
  fetchRequestsFailure,
  updateRequestRequest,
  updateRequestSuccess,
  updateRequestFailure,
  ServiceRequestsStats,
} from '../slices/poojaRequestsSlice';

// Worker saga: fetches pooja requests
function* fetchRequestsSaga(): SagaIterator {
  try {
    // Fetch all requests (no pagination, filter client-side)
    const response: { success: boolean; data: PoojaRequest[] } = yield call(
      poojaRequestsApi.getAll,
      {
        limit: 1000, // Fetch all
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }
    );
    
    const requests = response.data || [];
    
    // Calculate stats
    const stats: ServiceRequestsStats = {
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      confirmed: requests.filter(r => r.status === 'confirmed').length,
      inProgress: requests.filter(r => r.status === 'inProgress').length,
      completed: requests.filter(r => r.status === 'completed').length,
      cancelled: requests.filter(r => r.status === 'cancelled').length,
      totalRevenue: requests
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + (r.price || 0), 0),
    };
    
    yield put(fetchRequestsSuccess({ requests, stats }));
  } catch (error: any) {
    console.error('Failed to fetch service requests:', error);
    yield put(fetchRequestsFailure(error.message || 'Failed to fetch service requests'));
  }
}

// Worker saga: updates a pooja request
function* updateRequestSaga(action: PayloadAction<{ id: string; data: any }>): SagaIterator {
  try {
    const { id, data } = action.payload;
    
    const response: { success: boolean; data: PoojaRequest } = yield call(
      poojaRequestsApi.update,
      id,
      data
    );
    
    if (response.success && response.data) {
      yield put(updateRequestSuccess(response.data));
    } else {
      yield put(updateRequestFailure('Failed to update service request'));
    }
  } catch (error: any) {
    yield put(updateRequestFailure(error.message || 'An error occurred'));
  }
}

// Watcher saga: watches for pooja request actions
export default function* poojaRequestsSaga(): SagaIterator {
  yield takeLatest(fetchRequestsRequest.type, fetchRequestsSaga);
  yield takeLatest(updateRequestRequest.type, updateRequestSaga);
}





