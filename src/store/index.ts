import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import authReducer from './slices/authSlice';
import poojaRequestsReducer from './slices/poojaRequestsSlice';
import dashboardReducer from './slices/dashboardSlice';
import consultationsReducer from './slices/consultationsSlice';
import servicesReducer from './slices/servicesSlice';
import liveStreamsReducer from './slices/liveStreamsSlice';
import reviewsReducer from './slices/reviewsSlice';
import earningsReducer from './slices/earningsSlice';
import availabilityReducer from './slices/availabilitySlice';
import ticketReducer from './slices/ticketSlice';
import communicationReducer from './slices/communicationSlice';
import rootSaga from './sagas';

// Create saga middleware
const sagaMiddleware = createSagaMiddleware();

// Configure store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    poojaRequests: poojaRequestsReducer,
    dashboard: dashboardReducer,
    consultations: consultationsReducer,
    services: servicesReducer,
    liveStreams: liveStreamsReducer,
    reviews: reviewsReducer,
    earnings: earningsReducer,
    availability: availabilityReducer,
    ticket: ticketReducer,
    communication: communicationReducer,
    // Add more reducers here as needed
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false, // Disable thunk since we're using saga
      serializableCheck: false, // Disable serializable check for complex objects
    }).concat(sagaMiddleware),
  devTools: import.meta.env.MODE !== 'production',
});

// Run the root saga
sagaMiddleware.run(rootSaga);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
