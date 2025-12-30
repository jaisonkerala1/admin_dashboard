import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { astrologersApi } from '@/api';
import { UpdateAstrologerRequest, ApiResponse, Astrologer } from '@/types';
import {
  fetchAstrologerRequest,
  fetchAstrologerSuccess,
  fetchAstrologerFailure,
  updateAstrologerRequest,
  updateAstrologerSuccess,
  updateAstrologerFailure,
  uploadProfilePictureRequest,
  uploadProfilePictureSuccess,
  uploadProfilePictureFailure,
} from '../slices/astrologerSlice';

function* fetchAstrologerSaga(action: PayloadAction<string>) {
  try {
    const response: ApiResponse<Astrologer> = yield call(astrologersApi.getById, action.payload);
    if (response.success) {
      yield put(fetchAstrologerSuccess(response.data));
    } else {
      yield put(fetchAstrologerFailure(response.message || 'Failed to fetch astrologer'));
    }
  } catch (error: any) {
    yield put(fetchAstrologerFailure(error.response?.data?.message || 'Failed to fetch astrologer'));
  }
}

function* updateAstrologerSaga(action: PayloadAction<{ id: string; data: UpdateAstrologerRequest; callback?: () => void }>) {
  try {
    const response: ApiResponse<Astrologer> = yield call(astrologersApi.update, action.payload.id, action.payload.data);
    if (response.success) {
      yield put(updateAstrologerSuccess(response.data));
      if (action.payload.callback) {
        yield call(action.payload.callback);
      }
    } else {
      yield put(updateAstrologerFailure(response.message || 'Failed to update astrologer'));
    }
  } catch (error: any) {
    yield put(updateAstrologerFailure(error.response?.data?.message || 'Failed to update astrologer'));
  }
}

function* uploadProfilePictureSaga(action: PayloadAction<{ id: string; file: File }>) {
  try {
    const response: ApiResponse<{ profilePicture: string }> = yield call(astrologersApi.uploadProfilePicture, action.payload.id, action.payload.file);
    if (response.success) {
      yield put(uploadProfilePictureSuccess(response.data.profilePicture));
    } else {
      yield put(uploadProfilePictureFailure(response.message || 'Failed to upload profile picture'));
    }
  } catch (error: any) {
    yield put(uploadProfilePictureFailure(error.response?.data?.message || 'Failed to upload profile picture'));
  }
}

export default function* astrologerSaga() {
  yield takeLatest(fetchAstrologerRequest.type, fetchAstrologerSaga);
  yield takeLatest(updateAstrologerRequest.type, updateAstrologerSaga);
  yield takeLatest(uploadProfilePictureRequest.type, uploadProfilePictureSaga);
}

