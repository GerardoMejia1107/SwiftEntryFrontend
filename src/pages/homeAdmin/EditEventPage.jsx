import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/dashboardLayout/DashboardLayout';
import NewEventForm from './sections/NewEventModal';
import './AdminHomePage.css';

export default function EditEventPage() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const event = state?.event;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (!event) {
    return (
      <DashboardLayout
        user={auth?.user}
        activeItem="events"
        onLogout={handleLogout}
        onNewEvent={() => navigate('/home-admin/events/new')}
      >
        <div className="admin-page">
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            No se encontró el evento.{' '}
            <button
              type="button"
              onClick={() => navigate('/home-admin/events')}
              style={{ color: 'var(--brand-primary)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Volver a la lista
            </button>
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      user={auth?.user}
      activeItem="events"
      onLogout={handleLogout}
      onNewEvent={() => navigate('/home-admin/events/new')}
    >
      <NewEventForm
        initialEvent={event}
        onCancel={() => navigate('/home-admin/events')}
        onUpdated={() => navigate('/home-admin/events')}
      />
    </DashboardLayout>
  );
}
