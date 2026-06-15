import { useState } from 'react';
import OrganizerSidebar from './OrganizerSidebar';
import TopBar from './TopBar';
import './DashboardLayout.css';

export default function OrganizerLayout({ user, activeItem = 'dashboard', onLogout, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="dashboard">
      <OrganizerSidebar
        activeItem={activeItem}
        onLogout={onLogout}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {mobileOpen && (
        <div className="dashboard-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <div className="dashboard-body">
        <TopBar user={user} onToggleSidebar={() => setMobileOpen((v) => !v)} />
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}
