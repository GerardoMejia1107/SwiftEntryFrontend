import { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import './DashboardLayout.css';

/**
 * Shell de la pantalla principal de administrador: sidebar fijo a la izquierda,
 * barra superior con buscador/perfil y el área de contenido scrolleable.
 */
export default function DashboardLayout({
  user,
  activeItem = 'dashboard',
  onNavigate,
  onLogout,
  onNewEvent,
  children,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="dashboard">
      <Sidebar
        activeItem={activeItem}
        onNavigate={onNavigate}
        onLogout={onLogout}
        onNewEvent={onNewEvent}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {mobileOpen && (
        <div className="dashboard-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <div className="dashboard-body">
        <TopBar user={user} onToggleSidebar={() => setMobileOpen(v => !v)} />
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}
