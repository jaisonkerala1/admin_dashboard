import { all, fork } from 'redux-saga/effects';
import authSaga from './authSaga';

// Root saga: combines all sagas
export default function* rootSaga() {
  yield all([
    fork(authSaga),
    // Add more sagas here as needed
  ]);
}
