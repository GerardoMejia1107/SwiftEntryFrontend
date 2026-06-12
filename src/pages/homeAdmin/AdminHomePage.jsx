import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/dashboardLayout/DashboardLayout';
import StatsRow from './sections/StatsRow';
import FlaggedEventsTable from './sections/FlaggedEventsTable';
import RecentActivity from './sections/RecentActivity';
import BottomCards from './sections/BottomCards';
import NewEventModal from './sections/NewEventModal';
import './AdminHomePage.css';

export default function AdminHomePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const user = { name: 'Alex Rivera', roleLabel: 'Lead Administrator' };

  return (
    <DashboardLayout
      user={user}
      activeItem="dashboard"
      onLogout={handleLogout}
      onNewEvent={() => setModalOpen(true)}
    >
      <div className="admin-page">
        <header className="admin-page-header">
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">
            Resumen general del portal de organizadores.
          </p>
        </header>

        <StatsRow />

        <div className="admin-main-row">
          <FlaggedEventsTable />
          <RecentActivity />
        </div>

        <BottomCards />
      </div>

      <NewEventModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </DashboardLayout>
  );
}
