import { all, fork } from 'redux-saga/effects';
import authSaga from './authSaga';
import poojaRequestsSaga from './poojaRequestsSaga';
import dashboardSaga from './dashboardSaga';
import consultationsSaga from './consultationsSaga';

// Root saga: combines all sagas
export default function* rootSaga() {
  yield all([
    fork(authSaga),
    fork(poojaRequestsSaga),
    fork(dashboardSaga),
    fork(consultationsSaga),
    // Add more sagas here as needed
  ]);
}
