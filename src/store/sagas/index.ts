import { all, fork } from 'redux-saga/effects';
import authSaga from './authSaga';
import poojaRequestsSaga from './poojaRequestsSaga';
import dashboardSaga from './dashboardSaga';
import consultationsSaga from './consultationsSaga';
import servicesSaga from './servicesSaga';
import liveStreamsSaga from './liveStreamsSaga';
import reviewsSaga from './reviewsSaga';
import { earningsSaga } from './earningsSaga';
import { availabilitySaga } from './availabilitySaga';
import { ticketSaga } from './ticketSaga';
import { communicationSaga } from './communicationSaga';
import { approvalSaga } from './approvalSaga';
import { walletSaga } from './walletSaga';
import notificationSaga from './notificationSaga';
import rankingsSaga from './rankingsSaga';

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
    earningsSaga(),
    availabilitySaga(),
    ticketSaga(),
    communicationSaga(),
    approvalSaga(),
    walletSaga(),
    notificationSaga(),
    rankingsSaga(),
    // Add more sagas here as needed
  ]);
}
