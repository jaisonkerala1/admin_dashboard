import { call, put, takeLatest } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SagaIterator } from 'redux-saga';
import { approvalApi } from '@/api';
import type { ApprovalFilters } from '@/types/approval';
import {
  fetchRequestsRequest,
  fetchRequestsSuccess,
  fetchRequestsFailure,
  fetchStatsRequest,
  fetchStatsSuccess,
  fetchStatsFailure,
  fetchRequestDetailRequest,
  fetchRequestDetailSuccess,
  fetchRequestDetailFailure,
  approveRequestRequest,
  approveRequestSuccess,
  approveRequestFailure,
  rejectRequestRequest,
  rejectRequestSuccess,
  rejectRequestFailure,
} from '@/store/slices/approvalSlice';

// Fetch Requests Saga
function* fetchRequestsSaga(
  action: PayloadAction<{
    filters?: Partial<ApprovalFilters>;
    page?: number;
    limit?: number;
  }>
): SagaIterator {
  try {
    const response = yield call(approvalApi.getApprovalRequests, {
      filters: action.payload.filters,
      page: action.payload.page,
      limit: action.payload.limit,
    });

    if (response.success && response.data) {
      yield put(
        fetchRequestsSuccess({
          requests: response.data.requests,
          pagination: response.data.pagination,
        })
      );
    } else {
      yield put(fetchRequestsFailure(response.message || 'Failed to fetch approval requests'));
    }
  } catch (error: any) {
    yield put(fetchRequestsFailure(error.message || 'Failed to fetch approval requests'));
  }
}

// Fetch Stats Saga
function* fetchStatsSaga(): SagaIterator {
  try {
    const response = yield call(approvalApi.getApprovalStats);

    if (response.success && response.data) {
      yield put(fetchStatsSuccess(response.data));
    } else {
      yield put(fetchStatsFailure(response.message || 'Failed to fetch approval stats'));
    }
  } catch (error: any) {
    yield put(fetchStatsFailure(error.message || 'Failed to fetch approval stats'));
  }
}

// Fetch Request Detail Saga
function* fetchRequestDetailSaga(action: PayloadAction<string>): SagaIterator {
  try {
    const response = yield call(approvalApi.getApprovalRequestById, action.payload);

    if (response.success && response.data) {
      yield put(fetchRequestDetailSuccess(response.data));
    } else {
      yield put(fetchRequestDetailFailure(response.message || 'Failed to fetch request details'));
    }
  } catch (error: any) {
    yield put(fetchRequestDetailFailure(error.message || 'Failed to fetch request details'));
  }
}

// Approve Request Saga
function* approveRequestSaga(
  action: PayloadAction<{ requestId: string; notes?: string }>
): SagaIterator {
  try {
    const response = yield call(approvalApi.approveRequest, action.payload.requestId, {
      notes: action.payload.notes,
    });

    if (response.success && response.data) {
      yield put(approveRequestSuccess(response.data));
      // Refresh stats after approval
      yield put(fetchStatsRequest());
    } else {
      yield put(approveRequestFailure(response.message || 'Failed to approve request'));
    }
  } catch (error: any) {
    yield put(approveRequestFailure(error.message || 'Failed to approve request'));
  }
}

// Reject Request Saga
function* rejectRequestSaga(
  action: PayloadAction<{ requestId: string; rejectionReason: string }>
): SagaIterator {
  try {
    const response = yield call(approvalApi.rejectRequest, action.payload.requestId, {
      rejectionReason: action.payload.rejectionReason,
    });

    if (response.success && response.data) {
      yield put(rejectRequestSuccess(response.data));
      // Refresh stats after rejection
      yield put(fetchStatsRequest());
    } else {
      yield put(rejectRequestFailure(response.message || 'Failed to reject request'));
    }
  } catch (error: any) {
    yield put(rejectRequestFailure(error.message || 'Failed to reject request'));
  }
}

// Root Approval Saga
export function* approvalSaga(): SagaIterator {
  yield takeLatest(fetchRequestsRequest.type, fetchRequestsSaga);
  yield takeLatest(fetchStatsRequest.type, fetchStatsSaga);
  yield takeLatest(fetchRequestDetailRequest.type, fetchRequestDetailSaga);
  yield takeLatest(approveRequestRequest.type, approveRequestSaga);
  yield takeLatest(rejectRequestRequest.type, rejectRequestSaga);
}

