import { all, call, put, takeLatest, select } from 'redux-saga/effects';
import { analyticsApi } from '@/api';
import { 
  fetchCommunicationTrendsRequest, 
  fetchCommunicationTrendsSuccess, 
  fetchCommunicationTrendsFailure 
} from '../slices/communicationAnalyticsSlice';
import { RootState } from '../index';

function* fetchCommunicationTrendsSaga(action: any): any {
  try {
    const period = action.payload?.period || (yield select((state: RootState) => state.communicationAnalytics.period));
    const response = yield call(analyticsApi.getCommunicationTrends, period);
    
    if (response.data.success) {
      yield put(fetchCommunicationTrendsSuccess(response.data.data));
    } else {
      yield put(fetchCommunicationTrendsFailure(response.data.message || 'Failed to fetch trends'));
    }
  } catch (error: any) {
    yield put(fetchCommunicationTrendsFailure(error.message || 'An error occurred'));
  }
}

export default function* communicationAnalyticsSaga() {
  yield takeLatest(fetchCommunicationTrendsRequest.type, fetchCommunicationTrendsSaga);
}

