import { call, put, takeLatest } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import { liveStreamsApi } from '@/api';
import { LiveStream } from '@/types';
import {
  fetchStreamsRequest,
  fetchStreamsSuccess,
  fetchStreamsFailure,
  LiveStreamsStats,
} from '../slices/liveStreamsSlice';

function* fetchStreamsSaga(): SagaIterator {
  try {
    // Fetch all live streams
    const response: { success: boolean; data: LiveStream[] } = yield call(
      liveStreamsApi.getAll,
      {
        limit: 1000, // Fetch all
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }
    );

    const streams = response.data || [];

    // Calculate stats
    const stats: LiveStreamsStats = {
      total: streams.length,
      live: streams.filter(s => s.isLive).length,
      ended: streams.filter(s => !s.isLive).length,
      totalViews: streams.reduce((sum, s) => sum + (s.totalViews || 0), 0),
      totalLikes: streams.reduce((sum, s) => sum + (s.likes || 0), 0),
      peakViewers: Math.max(...streams.map(s => s.peakViewerCount || 0), 0),
    };

    yield put(fetchStreamsSuccess({ streams, stats }));
  } catch (error: any) {
    console.error('Failed to fetch live streams:', error);
    yield put(fetchStreamsFailure(error?.message || 'Failed to fetch live streams'));
  }
}

export default function* liveStreamsSaga(): SagaIterator {
  yield takeLatest(fetchStreamsRequest.type, fetchStreamsSaga);
}

