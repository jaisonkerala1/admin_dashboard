import { call, put, takeLatest } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import { reviewsApi } from '@/api';
import { Review } from '@/types';
import {
  fetchReviewsRequest,
  fetchReviewsSuccess,
  fetchReviewsFailure,
  ReviewsStats,
} from '../slices/reviewsSlice';

function* fetchReviewsSaga(): SagaIterator {
  try {
    // Fetch all reviews
    const response: { success: boolean; data: Review[] } = yield call(
      reviewsApi.getAll,
      {
        limit: 1000, // Fetch all
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }
    );

    const reviews = response.data || [];

    // Calculate stats
    const stats: ReviewsStats = {
      total: reviews.length,
      averageRating: reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0,
      verified: reviews.filter(r => r.isVerified).length,
      unverified: reviews.filter(r => !r.isVerified).length,
      public: reviews.filter(r => r.isPublic).length,
      hidden: reviews.filter(r => !r.isPublic).length,
      moderated: reviews.filter(r => r.isModerated).length,
      rating5: reviews.filter(r => r.rating === 5).length,
      rating4: reviews.filter(r => r.rating === 4).length,
      rating3: reviews.filter(r => r.rating === 3).length,
      rating2: reviews.filter(r => r.rating === 2).length,
      rating1: reviews.filter(r => r.rating === 1).length,
    };

    yield put(fetchReviewsSuccess({ reviews, stats }));
  } catch (error: any) {
    console.error('Failed to fetch reviews:', error);
    yield put(fetchReviewsFailure(error?.message || 'Failed to fetch reviews'));
  }
}

export default function* reviewsSaga(): SagaIterator {
  yield takeLatest(fetchReviewsRequest.type, fetchReviewsSaga);
}

