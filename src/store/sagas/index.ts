import { all, fork } from 'redux-saga/effects';
import authSaga from './authSaga';
import poojaRequestsSaga from './poojaRequestsSaga';
import dashboardSaga from './dashboardSaga';
import consultationsSaga from './consultationsSaga';
import servicesSaga from './servicesSaga';
import liveStreamsSaga from './liveStreamsSaga';
import reviewsSaga from './reviewsSaga';

// Root saga: combines all sagas
export default function* rootSaga() {
  yield all([
    fork(authSaga),
    fork(poojaRequestsSaga),
    fork(dashboardSaga),
    fork(consultationsSaga),
    fork(servicesSaga),
    fork(liveStreamsSaga),
    fork(reviewsSaga),
    // Add more sagas here as needed
  ]);
}
