import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/login/LoginPage';
import RegisterPage from './pages/registerUser/RegisterPage';
import RegisterOrganizerPage from './pages/registerOrganizer/RegisterOrganizerPage';
import AdminHomePage from './pages/homeAdmin/AdminHomePage';
import NewEventPage from './pages/homeAdmin/NewEventPage';
import OrganizerHomePage from './pages/homeOrganizer/OrganizerHomePage';
import ConsumerHomePage from './pages/homeConsumer/ConsumerHomePage';
import UnauthorizedPage from './pages/unauthorized/UnauthorizedPage';
import ProtectedRoute from './router/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register-organizer" element={<RegisterOrganizerPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Protected routes */}
          <Route path="/home-admin" element={
            <ProtectedRoute allowedRoles={['ROLE_ADMINISTRATOR']}>
              <AdminHomePage />
            </ProtectedRoute>
          } />
          <Route path="/home-admin/events/new" element={
            <ProtectedRoute allowedRoles={['ROLE_ADMINISTRATOR']}>
              <NewEventPage />
            </ProtectedRoute>
          } />
          <Route path="/home-organizer" element={
            <ProtectedRoute allowedRoles={['ROLE_ORGANIZER']}>
              <OrganizerHomePage />
            </ProtectedRoute>
          } />
          <Route path="/home-consumer" element={
            <ProtectedRoute allowedRoles={['ROLE_CONSUMER', 'ROLE_CLIENT']}>
              <ConsumerHomePage />
            </ProtectedRoute>
          } />

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}