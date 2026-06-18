import { useEffect } from 'react';
import './ReservationDetailModal.css';

const STATUS_META = {
  PENDING:   { label: 'Pending',   cls: 'rsd-status--pending'   },
  CONFIRMED: { label: 'Confirmed', cls: 'rsd-status--confirmed' },
  EXPIRED:   { label: 'Expired',   cls: 'rsd-status--expired'   },
  CANCELLED: { label: 'Cancelled', cls: 'rsd-status--cancelled' },
  REFUNDED:  { label: 'Refunded',  cls: 'rsd-status--refunded'  },
};

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const fmt = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const money = (val) => (val != null ? `$${Number(val).toFixed(2)}` : '—');

function MetaItem({ label, value, accent }) {
  return (
    <div className="rsd-meta-item">
      <span className="rsd-meta-label">{label}</span>
      <span className={`rsd-meta-value${accent ? ' rsd-meta-value--accent' : ''}`}>{value ?? '—'}</span>
    </div>
  );
}

/**
 * variant='admin'     — shows user ID, full financial breakdown, all dates, seat prices
 * variant='organizer' — shows name/email only, total only, reserved/expires dates, no seat prices
 */
export default function ReservationDetailModal({ reservation: r, variant = 'admin', onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const status = STATUS_META[r.status] ?? { label: r.status, cls: '' };
  const seats  = Array.isArray(r.reservationSeats) ? r.reservationSeats : [];
  const isAdmin = variant === 'admin';

  return (
    <div className="rsd-overlay" onClick={onClose}>
      <div className={`rsd-modal${isAdmin ? ' rsd-modal--wide' : ''}`} onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="rsd-header">
          <div className="rsd-header-left">
            <h2 className="rsd-title">Reservation #{r.id}</h2>
            <span className={`rsd-status-badge ${status.cls}`}>{status.label}</span>
          </div>
          <button type="button" className="rsd-close" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        {/* ── Body ── */}
        {isAdmin ? (
          <div className="rsd-body rsd-body--wide">

            {/* Left column: Customer + Financials */}
            <div className="rsd-col-left">
              <div>
                <p className="rsd-section-title">Customer</p>
                <div className="rsd-customer">
                  <div className="rsd-avatar">
                    {(r.userName ?? '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="rsd-customer-info">
                    <span className="rsd-customer-name">{r.userName || '—'}</span>
                    <span className="rsd-customer-email">{r.userEmail || '—'}</span>
                    <span className="rsd-customer-id">User ID #{r.userId}</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="rsd-section-title">Financials</p>
                <div className="rsd-meta-grid">
                  <MetaItem label="Subtotal" value={money(r.subtotal)} />
                  <MetaItem label="Tax"      value={money(r.taxAmount)} />
                  <MetaItem label="Discount" value={money(r.discountAmount)} />
                  <MetaItem label="Total"    value={money(r.totalAmount)} accent />
                </div>
              </div>
            </div>

            {/* Right column: Dates + Seats */}
            <div className="rsd-col-right">
              <div>
                <p className="rsd-section-title">Dates</p>
                <div className="rsd-meta-grid">
                  <MetaItem label="Reserved at"  value={fmt(r.reservedAt)} />
                  <MetaItem label="Expires at"   value={fmt(r.expiresAt)} />
                  <MetaItem label="Purchased at" value={fmt(r.purchasedAt)} />
                  <MetaItem label="Created at"   value={fmt(r.createdAt)} />
                </div>
              </div>

              {seats.length > 0 && (
                <div>
                  <p className="rsd-section-title">Seats ({seats.length})</p>
                  <div className="rsd-seats-list">
                    {seats.map((s) => (
                      <div key={s.id} className="rsd-seat-row">
                        <div className="rsd-seat-label">
                          <span className="rsd-seat-tag">{s.rowLabel}{s.seatNumber}</span>
                          <span className="rsd-seat-locality">{s.localityName || '—'}</span>
                        </div>
                        <span className="rsd-seat-price">{money(s.priceAtReservation)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer spans both columns */}
            <div className="rsd-footer rsd-full-row">
              <span>ID #{r.id}</span>
              {r.reservedAt && <span>· Reserved {fmt(r.reservedAt)}</span>}
            </div>
          </div>
        ) : (
          <div className="rsd-body">

            {/* Customer */}
            <div>
              <p className="rsd-section-title">Customer</p>
              <div className="rsd-customer">
                <div className="rsd-avatar">
                  {(r.userName ?? '?').charAt(0).toUpperCase()}
                </div>
                <div className="rsd-customer-info">
                  <span className="rsd-customer-name">{r.userName || '—'}</span>
                  <span className="rsd-customer-email">{r.userEmail || '—'}</span>
                </div>
              </div>
            </div>

            {/* Amount */}
            <div>
              <p className="rsd-section-title">Amount</p>
              <div className="rsd-meta-grid" style={{ gridTemplateColumns: '1fr' }}>
                <MetaItem label="Total" value={money(r.totalAmount)} accent />
              </div>
            </div>

            {/* Dates */}
            <div>
              <p className="rsd-section-title">Dates</p>
              <div className="rsd-meta-grid">
                <MetaItem label="Reserved at" value={fmt(r.reservedAt)} />
                <MetaItem label="Expires at"  value={fmt(r.expiresAt)} />
              </div>
            </div>

            {/* Seats */}
            {seats.length > 0 && (
              <div>
                <p className="rsd-section-title">Seats ({seats.length})</p>
                <div className="rsd-seats-list">
                  {seats.map((s) => (
                    <div key={s.id} className="rsd-seat-row">
                      <div className="rsd-seat-label">
                        <span className="rsd-seat-tag">{s.rowLabel}{s.seatNumber}</span>
                        <span className="rsd-seat-locality">{s.localityName || '—'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="rsd-footer">
              <span>ID #{r.id}</span>
              {r.reservedAt && <span>· Reserved {fmt(r.reservedAt)}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
