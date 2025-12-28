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
  ServiceRequestDetail,
  CreateServiceRequest,
  Reviews,
  LiveStreams,
  Discussions,
  Analytics,
  Notifications,
  Communication,
  CommunicationAnalytics,
  Earnings,
  Wallet,
  Calendar,
  Support,
  Approvals,
} from './pages';
import { ROUTES } from './utils/constants';
import { ToastProvider } from './contexts/ToastContext';
import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  return (
    <ToastProvider>
      <NotificationProvider>
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
              <Route path={`${ROUTES.SERVICE_REQUESTS}/create`} element={<CreateServiceRequest />} />
              <Route path={`${ROUTES.SERVICE_REQUESTS}/:id`} element={<ServiceRequestDetail />} />
        <Route path={ROUTES.REVIEWS} element={<Reviews />} />
        <Route path={ROUTES.LIVE_STREAMS} element={<LiveStreams />} />
        <Route path={ROUTES.DISCUSSIONS} element={<Discussions />} />
        <Route path={ROUTES.NOTIFICATIONS} element={<Notifications />} />
        <Route path={ROUTES.COMMUNICATION} element={<Communication />} />
        <Route path={ROUTES.COMMUNICATION_ANALYTICS} element={<CommunicationAnalytics />} />
        <Route path={ROUTES.ANALYTICS} element={<Analytics />} />
        <Route path={ROUTES.EARNINGS} element={<Earnings />} />
        <Route path={ROUTES.WALLET} element={<Wallet />} />
        <Route path={ROUTES.CALENDAR} element={<Calendar />} />
        <Route path={`${ROUTES.SUPPORT}/*`} element={<Support />} />
        <Route path={ROUTES.APPROVALS} element={<Approvals />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </BrowserRouter>
      </NotificationProvider>
    </ToastProvider>
  );
}

export default App;

