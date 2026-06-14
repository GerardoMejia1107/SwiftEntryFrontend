import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/dashboardLayout/DashboardLayout';
import NewEventForm from './sections/NewEventModal';
import './AdminHomePage.css';

export default function NewEventPage() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const user = auth?.user;



  return (
    <DashboardLayout
      user={user}
      activeItem="events"
      onLogout={handleLogout}
      onNewEvent={() => navigate('/home-admin/events/new')}
    >
      <NewEventForm
        onCancel={() => navigate('/home-admin')}
        onCreated={() => navigate('/home-admin')}
      />
    </DashboardLayout>
  );
}
