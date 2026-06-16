import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/login/LoginPage';
import RegisterPage from './pages/registerUser/RegisterPage';
import RegisterOrganizerPage from './pages/registerOrganizer/RegisterOrganizerPage';
import AdminHomePage from './pages/homeAdmin/AdminHomePage';
import NewEventPage from './pages/homeAdmin/NewEventPage';
import EventsPage from './pages/homeAdmin/EventsPage';
import EditEventPage from './pages/homeAdmin/EditEventPage';
import UsersPage from './pages/homeAdmin/UsersPage';
import OrganizerHomePage from './pages/homeOrganizer/OrganizerHomePage';
import OrganizerEventsPage from './pages/homeOrganizer/OrganizerEventsPage';
import OrganizerLocalitiesPage from './pages/homeOrganizer/OrganizerLocalitiesPage';
import ConsumerHomePage from './pages/homeConsumer/ConsumerHomePage';
import ConsumerEventsPage from './pages/homeConsumer/ConsumerEventsPage';
import SeatSelectionPage from './pages/seatSelection/SeatSelectionPage';
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
          <Route path="/home-admin/events" element={
            <ProtectedRoute allowedRoles={['ROLE_ADMINISTRATOR']}>
              <EventsPage />
            </ProtectedRoute>
          } />
          <Route path="/home-admin/events/:id/edit" element={
            <ProtectedRoute allowedRoles={['ROLE_ADMINISTRATOR']}>
              <EditEventPage />
            </ProtectedRoute>
          } />
          <Route path="/home-admin/events/new" element={
            <ProtectedRoute allowedRoles={['ROLE_ADMINISTRATOR']}>
              <NewEventPage />
            </ProtectedRoute>
          } />
          <Route path="/home-admin/users" element={
            <ProtectedRoute allowedRoles={['ROLE_ADMINISTRATOR']}>
              <UsersPage />
            </ProtectedRoute>
          } />
          <Route path="/home-organizer" element={
            <ProtectedRoute allowedRoles={['ROLE_ORGANIZER']}>
              <OrganizerHomePage />
            </ProtectedRoute>
          } />
          <Route path="/home-organizer/events" element={
            <ProtectedRoute allowedRoles={['ROLE_ORGANIZER']}>
              <OrganizerEventsPage />
            </ProtectedRoute>
          } />
          <Route path="/home-organizer/localities" element={
            <ProtectedRoute allowedRoles={['ROLE_ORGANIZER']}>
              <OrganizerLocalitiesPage />
            </ProtectedRoute>
          } />
          <Route path="/home-consumer" element={
            <ProtectedRoute allowedRoles={['ROLE_CONSUMER', 'ROLE_CLIENT']}>
              <ConsumerHomePage />
            </ProtectedRoute>
          } />
          <Route path="/home-consumer/events" element={
            <ProtectedRoute allowedRoles={['ROLE_CONSUMER', 'ROLE_CLIENT']}>
              <ConsumerEventsPage />
            </ProtectedRoute>
          } />
          <Route path="/home-consumer/events/:eventId/seats" element={
            <ProtectedRoute allowedRoles={['ROLE_CONSUMER', 'ROLE_CLIENT']}>
              <SeatSelectionPage />
            </ProtectedRoute>
          } />

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}