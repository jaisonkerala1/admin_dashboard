import { takeLatest, put } from 'redux-saga/effects';
import { fetchNotificationsRequest, fetchNotificationsSuccess, fetchNotificationsFailure } from '../slices/notificationSlice';

function* fetchNotificationsSaga() {
  try {
    // In a real app, this would be an API call
    // const response = yield call(api.getNotifications);
    // yield put(fetchNotificationsSuccess(response.data));
    
    // For now, we just rely on initial state or re-emit it if needed
    // yield put(fetchNotificationsSuccess([])); 
  } catch (error: any) {
    yield put(fetchNotificationsFailure(error.message || 'Failed to fetch notifications'));
  }
}

export default function* notificationSaga() {
  yield takeLatest(fetchNotificationsRequest.type, fetchNotificationsSaga);
}

