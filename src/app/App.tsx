import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from '../features/auth/LoginPage';
import { CreateRequestPage } from '../features/requests/CreateRequestPage';
import { RequestsDashboard } from '../features/requests/RequestsDashboard';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/requests" element={<RequestsDashboard />} />
      <Route path="/requests/new" element={<CreateRequestPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
