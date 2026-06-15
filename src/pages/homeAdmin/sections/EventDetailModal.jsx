import { useEffect } from 'react';
import './EventDetailModal.css';

const STATUS_CLASS = {
  PUBLISHED: 'evd-status--published',
  DRAFT: 'evd-status--draft',
  CANCELLED: 'evd-status--cancelled',
  FINISHED: 'evd-status--finished',
};

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-SV', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

function MetaItem({ label, value }) {
  return (
    <div className="evd-meta-item">
      <span className="evd-meta-label">{label}</span>
      <span className="evd-meta-value">{value || '—'}</span>
    </div>
  );
}

export default function EventDetailModal({ event, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const organizerName = event.organizer?.name
    ?? event.organizer?.firstName
    ?? (event.organizerId ? `ID ${event.organizerId}` : '—');

  const hasAddress = event.address &&
    (event.address.streetAddress || event.address.municipality || event.address.country);

  const addressLine = hasAddress
    ? [
        event.address.streetAddress,
        event.address.neighborhood,
        event.address.municipality,
        event.address.department,
        event.address.country,
      ].filter(Boolean).join(', ')
    : null;

  const hasLocalities = Array.isArray(event.localities) && event.localities.length > 0;

  return (
    <div className="evd-overlay" onClick={onClose}>
      <div className="evd-modal" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="evd-header">
          <div className="evd-header-left">
            <h2 className="evd-title">{event.name}</h2>
            <div className="evd-header-badges">
              <span className={`evd-status-badge ${STATUS_CLASS[event.status] ?? ''}`}>
                {event.status}
              </span>
              <span className="evd-category-badge">{event.category}</span>
            </div>
          </div>
          <button type="button" className="evd-close" onClick={onClose} aria-label="Cerrar">
            <CloseIcon />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="evd-body">

          {/* Image preview */}
          {event.imageUrl && (
            <div className="evd-image-wrap">
              <img src={event.imageUrl} alt={event.name} className="evd-image" />
            </div>
          )}

          {/* Description */}
          {event.description && (
            <p className="evd-description">{event.description}</p>
          )}

          {/* Key metadata grid */}
          <div className="evd-meta-grid">
            <MetaItem label="Organizer" value={organizerName} />
            <MetaItem label="Venue" value={event.venueName} />
            <MetaItem label="Start date" value={formatDate(event.startDate)} />
            <MetaItem label="End date" value={formatDate(event.endDate)} />
          </div>

          {/* Address */}
          {hasAddress && (
            <div className="evd-section">
              <p className="evd-section-title">Physical address</p>
              <p className="evd-address-line">{addressLine}</p>
              {event.address.referencePoint && (
                <p className="evd-address-ref">{event.address.referencePoint}</p>
              )}
            </div>
          )}

          {/* Localities */}
          {hasLocalities && (
            <div className="evd-section">
              <p className="evd-section-title">Localities</p>
              <div className="evd-localities">
                {event.localities.map((loc, i) => (
                  <div key={loc.id ?? i} className="evd-locality-card">
                    <div className="evd-locality-row">
                      <span className="evd-locality-name">{loc.name}</span>
                      <span className="evd-locality-price">${Number(loc.price ?? 0).toFixed(2)}</span>
                    </div>
                    {loc.description && (
                      <p className="evd-locality-desc">{loc.description}</p>
                    )}
                    <div className="evd-locality-slots">
                      <span>Capacity: <strong>{loc.capacity ?? '—'}</strong></span>
                      <span>Available: <strong>{loc.availableSlots ?? '—'}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer timestamps */}
          <div className="evd-timestamps">
            <span>Created {formatDate(event.createdAt)}</span>
            {event.updatedAt && event.updatedAt !== event.createdAt && (
              <span>· Updated {formatDate(event.updatedAt)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
