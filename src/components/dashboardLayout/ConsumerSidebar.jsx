import { useNavigate } from 'react-router-dom';
import { BrandLogo } from '../formComponents/FormComponents';

const NAV_ROUTES = {
  home:   '/home-consumer',
  events: '/home-consumer/events',
};

const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const EventsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const ReservationsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
    <path d="M13 5v14" strokeDasharray="2 2" />
  </svg>
);

const PaymentsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const ProfileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
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
  { id: 'home',         label: 'Home',            icon: HomeIcon         },
  { id: 'events',       label: 'View Events',      icon: EventsIcon       },
  { id: 'reservations', label: 'My Reservations',  icon: ReservationsIcon },
  { id: 'payments',     label: 'My Payments',      icon: PaymentsIcon     },
];

export default function ConsumerSidebar({ activeItem, onLogout, mobileOpen, onCloseMobile }) {
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
          <span className="sidebar-brand-name">SwiftEntry</span>
          <span className="sidebar-brand-sub">Consumer Portal</span>
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
        <button type="button" className="sidebar-link" onClick={() => handleNavigate('profile')}>
          <span className="sidebar-item-icon"><ProfileIcon /></span>
          My Profile
        </button>
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
