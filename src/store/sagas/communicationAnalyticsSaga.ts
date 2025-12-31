import { call, put, takeLatest, select } from 'redux-saga/effects';
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
    
    console.log('📊 [Communication Analytics] API Response:', response);
    
    if (response.data.success) {
      console.log('✅ [Communication Analytics] Trends data:', response.data.data);
      yield put(fetchCommunicationTrendsSuccess(response.data.data));
    } else {
      console.error('❌ [Communication Analytics] API returned error:', response.data.message);
      yield put(fetchCommunicationTrendsFailure(response.data.message || 'Failed to fetch trends'));
    }
  } catch (error: any) {
    console.error('💥 [Communication Analytics] Saga error:', error);
    yield put(fetchCommunicationTrendsFailure(error.message || 'An error occurred'));
  }
}

export default function* communicationAnalyticsSaga() {
  yield takeLatest(fetchCommunicationTrendsRequest.type, fetchCommunicationTrendsSaga);
}

