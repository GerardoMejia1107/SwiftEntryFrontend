import { use, useEffect } from 'react';
import './UserDetailModal.css';

const ROLE_CLASS = {
  Admin: 'usd-role--admin',
  Organizer: 'usd-role--organizer',
  User: 'usd-role--user',
};

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-SV', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
};

function MetaItem({ label, value }) {
  return (
    <div className="usd-meta-item">
      <span className="usd-meta-label">{label}</span>
      <span className="usd-meta-value">{value || '—'}</span>
    </div>
  );
}

export function getRoleName(user) {
  switch (user.roleId) {
    case 1: return 'Admin';
    case 2: return 'Organizer';
    case 3: return 'User';
    default: return 'Unknown';
  }
}

export default function UserDetailModal({ user, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const roleName = getRoleName(user);
  const fullName = [user.name, user.lastName].filter(Boolean).join(' ') || user.username || '—';

  const hasAddress = user.address &&
    (user.address.streetAddress || user.address.municipality || user.address.country);

  const addressLine = hasAddress
    ? [
      user.address.streetAddress,
      user.address.neighborhood,
      user.address.municipality,
      user.address.department,
      user.address.country,
    ].filter(Boolean).join(', ')
    : null;

  return (
    <div className="usd-overlay" onClick={onClose}>
      <div className="usd-modal" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="usd-header">
          <div className="usd-header-left">
            <div className="usd-avatar">{fullName.charAt(0).toUpperCase()}</div>
            <div className="usd-header-info">
              <h2 className="usd-title">{fullName}</h2>
              <span className={`usd-role-badge ${ROLE_CLASS[roleName] ?? ''}`}>
                {roleName}
              </span>
            </div>
          </div>
          <button type="button" className="usd-close" onClick={onClose} aria-label="Cerrar">
            <CloseIcon />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="usd-body">

          {/* Key metadata grid */}
          <div className="usd-meta-grid">
            <MetaItem label="Email" value={user.email} />
            <MetaItem label="Phone" value={user.phoneNumber} />
            <MetaItem label="DUI" value={user.dui} />
            <MetaItem label="Birth date" value={formatDate(user.birthDate)} />
          </div>

          {/* Address */}
          {hasAddress && (
            <div className="usd-section">
              <p className="usd-section-title">Address</p>
              <p className="usd-address-line">{addressLine}</p>
            </div>
          )}

          {/* Footer timestamps */}
          <div className="usd-timestamps">
            <span>ID #{user.id}</span>
            {user.createdAt && (
              <span>· Joined {formatDate(user.createdAt)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
