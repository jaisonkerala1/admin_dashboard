import { call, put, takeLatest, SagaIterator } from 'redux-saga/effects';
import { consultationsApi } from '@/api';
import { Consultation } from '@/types';
import {
  fetchConsultationsRequest,
  fetchConsultationsSuccess,
  fetchConsultationsFailure,
  ConsultationsStats,
} from '../slices/consultationsSlice';

function* fetchConsultationsSaga(): SagaIterator {
  try {
    // Fetch all consultations (no pagination, filter client-side)
    const response: { data: Consultation[] } = yield call(consultationsApi.getAll, {
      limit: 1000, // Fetch all
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });

    const consultations = response.data || [];

    // Calculate stats
    const stats: ConsultationsStats = {
      total: consultations.length,
      scheduled: consultations.filter(c => c.status === 'scheduled').length,
      inProgress: consultations.filter(c => c.status === 'inProgress').length,
      completed: consultations.filter(c => c.status === 'completed').length,
      cancelled: consultations.filter(c => c.status === 'cancelled').length,
      noShow: consultations.filter(c => c.status === 'noShow').length,
      totalRevenue: consultations
        .filter(c => c.status === 'completed')
        .reduce((sum, c) => sum + (c.amount || 0), 0),
    };

    yield put(fetchConsultationsSuccess({ consultations, stats }));
  } catch (error: any) {
    console.error('Failed to fetch consultations:', error);
    yield put(fetchConsultationsFailure(error?.message || 'Failed to fetch consultations'));
  }
}

export default function* consultationsSaga(): SagaIterator {
  yield takeLatest(fetchConsultationsRequest.type, fetchConsultationsSaga);
}

