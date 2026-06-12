const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

function initialsOf(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

export default function TopBar({ user, onToggleSidebar }) {
  const name = user?.name ?? 'Administrator';
  const role = user?.roleLabel ?? 'Lead Administrator';

  return (
    <header className="topbar">
      <button type="button" className="topbar-menu-btn" onClick={onToggleSidebar} aria-label="Abrir menú">
        <MenuIcon />
      </button>

      <div className="topbar-search">
        <span className="topbar-search-icon"><SearchIcon /></span>
        <input
          type="search"
          className="topbar-search-input"
          placeholder="Search analytics, events, or users..."
        />
      </div>

      <div className="topbar-actions">
        <button type="button" className="topbar-bell" aria-label="Notificaciones">
          <BellIcon />
          <span className="topbar-bell-dot" />
        </button>

        <div className="topbar-profile">
          <div className="topbar-profile-text">
            <span className="topbar-profile-name">{name}</span>
            <span className="topbar-profile-role">{role}</span>
          </div>
          <div className="topbar-avatar">{initialsOf(name)}</div>
        </div>
      </div>
    </header>
  );
}
