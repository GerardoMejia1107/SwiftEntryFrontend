import { useNavigate } from 'react-router-dom';
import { BrandLogo } from '../formComponents/FormComponents';

const NAV_ROUTES = {
  dashboard: '/home-organizer',
  events: '/home-organizer/events',
  localities: '/home-organizer/localities',
};

const DashboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </svg>
);

const EventsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const LocalitiesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const HelpIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Dashboard',  icon: DashboardIcon  },
  { id: 'events',     label: 'My Events',  icon: EventsIcon     },
  { id: 'localities', label: 'Localities', icon: LocalitiesIcon },
];

export default function OrganizerSidebar({ activeItem, onLogout, mobileOpen, onCloseMobile }) {
  const navigate = useNavigate();

  const handleNavigate = (id) => {
    if (NAV_ROUTES[id]) navigate(NAV_ROUTES[id]);
    onCloseMobile?.();
  };

  return (
    <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
      <div className="sidebar-brand">
        <BrandLogo size="sm" />
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-name">VibeTick</span>
          <span className="sidebar-brand-sub">Organizer Portal</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`sidebar-item ${activeItem === id ? 'sidebar-item--active' : ''}`}
            onClick={() => handleNavigate(id)}
          >
            <span className="sidebar-item-icon"><Icon /></span>
            {label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button type="button" className="sidebar-link" onClick={() => handleNavigate('help')}>
          <span className="sidebar-item-icon"><HelpIcon /></span>
          Help Center
        </button>
        <button type="button" className="sidebar-link" onClick={onLogout}>
          <span className="sidebar-item-icon"><LogoutIcon /></span>
          Logout
        </button>
      </div>
    </aside>
  );
}
