import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {
  Login,
  Dashboard,
  AstrologersList,
  AstrologerDetail,
  Users,
  Consultations,
  Services,
  ServiceDetail,
  ServiceRequests,
  Reviews,
  LiveStreams,
  Discussions,
  Analytics,
} from './pages';
import { ROUTES } from './utils/constants';
import { ToastProvider } from './contexts/ToastContext';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path={ROUTES.LOGIN} element={<Login />} />

          {/* Main Routes */}
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTES.ASTROLOGERS} element={<AstrologersList />} />
          <Route path="/astrologers/:id" element={<AstrologerDetail />} />
          <Route path={ROUTES.USERS} element={<Users />} />
          <Route path={ROUTES.CONSULTATIONS} element={<Consultations />} />
          <Route path={ROUTES.SERVICES} element={<Services />} />
          <Route path={`${ROUTES.SERVICES}/:id`} element={<ServiceDetail />} />
          <Route path={ROUTES.SERVICE_REQUESTS} element={<ServiceRequests />} />
          <Route path={ROUTES.REVIEWS} element={<Reviews />} />
          <Route path={ROUTES.LIVE_STREAMS} element={<LiveStreams />} />
          <Route path={ROUTES.DISCUSSIONS} element={<Discussions />} />
          <Route path={ROUTES.ANALYTICS} element={<Analytics />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;

