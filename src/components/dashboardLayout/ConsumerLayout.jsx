import { useState } from 'react';
import ConsumerSidebar from './ConsumerSidebar';
import TopBar from './TopBar';
import ReservationBanner from '../reservationBanner/ReservationBanner';
import './DashboardLayout.css';

export default function ConsumerLayout({ user, activeItem = 'home', onLogout, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="dashboard">
      <ConsumerSidebar
        activeItem={activeItem}
        onLogout={onLogout}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {mobileOpen && (
        <div className="dashboard-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <div className="dashboard-body">
        <TopBar user={user} onToggleSidebar={() => setMobileOpen(v => !v)} />
        <ReservationBanner />
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}
