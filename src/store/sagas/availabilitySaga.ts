import { all, call, put, select, takeLatest } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SagaIterator } from 'redux-saga';
import { availabilityApi } from '@/api';
import type { RootState } from '@/store';
import type { Availability, Holiday } from '@/types';
import {
  createAvailabilityFailure,
  createAvailabilityRequest,
  createAvailabilitySuccess,
  createHolidayFailure,
  createHolidayRequest,
  createHolidaySuccess,
  deleteAvailabilityFailure,
  deleteAvailabilityRequest,
  deleteAvailabilitySuccess,
  deleteHolidayFailure,
  deleteHolidayRequest,
  deleteHolidaySuccess,
  fetchAllHolidaysFailure,
  fetchAllHolidaysRequest,
  fetchAllHolidaysSuccess,
  fetchAstrologerAvailabilityFailure,
  fetchAstrologerAvailabilityRequest,
  fetchAstrologerAvailabilitySuccess,
  fetchAvailabilitySummariesFailure,
  fetchAvailabilitySummariesRequest,
  fetchAvailabilitySummariesSuccess,
  updateAvailabilityFailure,
  updateAvailabilityRequest,
  updateAvailabilitySuccess,
} from '../slices/availabilitySlice';

function* fetchSummariesSaga(action: PayloadAction<{ date?: string } | undefined>): SagaIterator {
  try {
    const date = action.payload?.date;
    const response: { success: boolean; data?: any; error?: string } = yield call(
      availabilityApi.getAllAstrologersAvailability,
      date
    );

    if (response.success && response.data) {
      yield put(fetchAvailabilitySummariesSuccess(response.data));
    } else {
      yield put(fetchAvailabilitySummariesFailure(response.error || 'Failed to load availability summaries'));
    }
  } catch (err: any) {
    yield put(fetchAvailabilitySummariesFailure(err?.message || 'Failed to load availability summaries'));
  }
}

function* fetchAstrologerDetailSaga(action: PayloadAction<{ astrologerId: string }>): SagaIterator {
  try {
    const [availabilityRes, holidaysRes]: [
      { success: boolean; data?: Availability[]; error?: string },
      { success: boolean; data?: Holiday[]; error?: string },
    ] = yield all([
      call(availabilityApi.getAstrologerAvailability, action.payload.astrologerId),
      call(availabilityApi.getAstrologerHolidays, action.payload.astrologerId),
    ]);

    if (availabilityRes.success && holidaysRes.success) {
      yield put(
        fetchAstrologerAvailabilitySuccess({
          availability: availabilityRes.data || [],
          holidays: holidaysRes.data || [],
        })
      );
    } else {
      yield put(fetchAstrologerAvailabilityFailure('Failed to load astrologer availability'));
    }
  } catch (err: any) {
    yield put(fetchAstrologerAvailabilityFailure(err?.message || 'Failed to load astrologer availability'));
  }
}

function* fetchAllHolidaysSaga(): SagaIterator {
  try {
    const response: { success: boolean; data?: Holiday[]; error?: string } = yield call(availabilityApi.getAllHolidays);
    if (response.success && response.data) {
      yield put(fetchAllHolidaysSuccess(response.data));
    } else {
      yield put(fetchAllHolidaysFailure(response.error || 'Failed to load holidays'));
    }
  } catch (err: any) {
    yield put(fetchAllHolidaysFailure(err?.message || 'Failed to load holidays'));
  }
}

function* refreshAfterMutation(): SagaIterator {
  const state: RootState = yield select((s: RootState) => s);
  const date = state.availability.filters.date;
  const selectedAstrologerId = state.availability.selectedAstrologerId;

  yield put(fetchAvailabilitySummariesRequest({ date }));
  yield put(fetchAllHolidaysRequest());
  if (selectedAstrologerId) {
    yield put(fetchAstrologerAvailabilityRequest({ astrologerId: selectedAstrologerId }));
  }
}

function* createAvailabilitySaga(action: PayloadAction<Omit<Availability, '_id' | 'createdAt' | 'updatedAt'>>): SagaIterator {
  try {
    const res: { success: boolean; error?: string } = yield call(availabilityApi.createAvailability, action.payload);
    if (res.success) {
      yield put(createAvailabilitySuccess());
      yield call(refreshAfterMutation);
    } else {
      yield put(createAvailabilityFailure(res.error || 'Failed to create availability'));
    }
  } catch (err: any) {
    yield put(createAvailabilityFailure(err?.message || 'Failed to create availability'));
  }
}

function* updateAvailabilitySaga(
  action: PayloadAction<Partial<Omit<Availability, '_id' | 'createdAt' | 'updatedAt'>> & { _id: string }>
): SagaIterator {
  try {
    const res: { success: boolean; error?: string } = yield call(availabilityApi.updateAvailability, action.payload);
    if (res.success) {
      yield put(updateAvailabilitySuccess());
      yield call(refreshAfterMutation);
    } else {
      yield put(updateAvailabilityFailure(res.error || 'Failed to update availability'));
    }
  } catch (err: any) {
    yield put(updateAvailabilityFailure(err?.message || 'Failed to update availability'));
  }
}

function* deleteAvailabilitySaga(action: PayloadAction<{ id: string }>): SagaIterator {
  try {
    const res: { success: boolean; error?: string } = yield call(availabilityApi.deleteAvailability, action.payload.id);
    if (res.success) {
      yield put(deleteAvailabilitySuccess());
      yield call(refreshAfterMutation);
    } else {
      yield put(deleteAvailabilityFailure(res.error || 'Failed to delete availability'));
    }
  } catch (err: any) {
    yield put(deleteAvailabilityFailure(err?.message || 'Failed to delete availability'));
  }
}

function* createHolidaySaga(action: PayloadAction<Omit<Holiday, '_id' | 'createdAt'>>): SagaIterator {
  try {
    const res: { success: boolean; error?: string } = yield call(availabilityApi.createHoliday, action.payload);
    if (res.success) {
      yield put(createHolidaySuccess());
      yield call(refreshAfterMutation);
    } else {
      yield put(createHolidayFailure(res.error || 'Failed to create holiday'));
    }
  } catch (err: any) {
    yield put(createHolidayFailure(err?.message || 'Failed to create holiday'));
  }
}

function* deleteHolidaySaga(action: PayloadAction<{ id: string }>): SagaIterator {
  try {
    const res: { success: boolean; error?: string } = yield call(availabilityApi.deleteHoliday, action.payload.id);
    if (res.success) {
      yield put(deleteHolidaySuccess());
      yield call(refreshAfterMutation);
    } else {
      yield put(deleteHolidayFailure(res.error || 'Failed to delete holiday'));
    }
  } catch (err: any) {
    yield put(deleteHolidayFailure(err?.message || 'Failed to delete holiday'));
  }
}

export function* availabilitySaga(): SagaIterator {
  yield takeLatest(fetchAvailabilitySummariesRequest.type, fetchSummariesSaga);
  yield takeLatest(fetchAstrologerAvailabilityRequest.type, fetchAstrologerDetailSaga);
  yield takeLatest(fetchAllHolidaysRequest.type, fetchAllHolidaysSaga);
  yield takeLatest(createAvailabilityRequest.type, createAvailabilitySaga);
  yield takeLatest(updateAvailabilityRequest.type, updateAvailabilitySaga);
  yield takeLatest(deleteAvailabilityRequest.type, deleteAvailabilitySaga);
  yield takeLatest(createHolidayRequest.type, createHolidaySaga);
  yield takeLatest(deleteHolidayRequest.type, deleteHolidaySaga);
}


