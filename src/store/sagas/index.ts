import { all, fork } from 'redux-saga/effects';
import authSaga from './authSaga';
import poojaRequestsSaga from './poojaRequestsSaga';
import dashboardSaga from './dashboardSaga';
import consultationsSaga from './consultationsSaga';
import servicesSaga from './servicesSaga';

// Root saga: combines all sagas
export default function* rootSaga() {
  yield all([
    fork(authSaga),
    fork(poojaRequestsSaga),
    fork(dashboardSaga),
    fork(consultationsSaga),
    fork(servicesSaga),
    // Add more sagas here as needed
  ]);
}
