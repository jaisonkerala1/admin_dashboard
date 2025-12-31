import { all, call, put, select, takeLatest } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import { reviewsApi } from '@/api';
import { RootState } from '../index';
import {
  fetchReviewsRequest,
  fetchReviewsSuccess,
  fetchReviewsFailure,
} from '../slices/reviewsSlice';

function* fetchReviewsSaga(): SagaIterator {
  try {
    const state: RootState = yield select();
    const { filter, search, currentPage, entriesPerPage } = state.reviews;

    // Map frontend filters to backend parameters
    const params: any = {
      page: currentPage,
      limit: entriesPerPage,
      search: search || undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };

    if (filter === 'needsReply') params.needsReply = true;
    if (filter === 'pendingModeration') params.isModerated = false;
    if (filter === 'public') params.isPublic = true;
    if (filter === 'hidden') params.isPublic = false;
    if (filter === 'negative') {
      params.minRating = 1;
      params.maxRating = 2;
    }
    if (filter === 'adminCreated') params.isAdminCreated = true;

    // Fetch reviews and stats in parallel
    const [reviewsResponse, statsResponse]: [any, any] = yield all([
      call(reviewsApi.getAll, params),
      call(reviewsApi.getStats),
    ]);

    yield put(
      fetchReviewsSuccess({
        reviews: reviewsResponse.data || [],
        stats: statsResponse.data,
        totalPages: reviewsResponse.pagination?.pages || 1,
      })
    );
  } catch (error: any) {
    console.error('Failed to fetch reviews:', error);
    yield put(fetchReviewsFailure(error?.message || 'Failed to fetch reviews'));
  }
}

export default function* reviewsSaga(): SagaIterator {
  yield takeLatest(fetchReviewsRequest.type, fetchReviewsSaga);
}


