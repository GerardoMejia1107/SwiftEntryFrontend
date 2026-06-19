import { useEffect } from 'react';
import QRCode from 'react-qr-code';
import './DetailModal.css';

const STATUS = {
  ISSUED:    { label: 'Issued',    cls: 'dtl-badge--issued'    },
  USED:      { label: 'Used',      cls: 'dtl-badge--used'      },
  CANCELLED: { label: 'Cancelled', cls: 'dtl-badge--cancelled' },
  REFUNDED:  { label: 'Refunded',  cls: 'dtl-badge--refunded'  },
};

const fmt = (iso) => {
  if (!iso) return null;
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

function Field({ label, value, mono }) {
  if (!value) return null;
  return (
    <div className="dtl-field">
      <span className="dtl-field-label">{label}</span>
      <span className={`dtl-field-value${mono ? ' dtl-field-value--mono' : ''}`}>{value}</span>
    </div>
  );
}

export default function TicketDetailModal({ ticket: t, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const badge = STATUS[t.status] ?? { label: t.status, cls: '' };
  const seatLabel = t.rowLabel && t.seatNumber ? `${t.rowLabel}${t.seatNumber}` : null;

  return (
    <div className="dtl-overlay" onClick={onClose}>
      <div className="dtl-modal" onClick={(e) => e.stopPropagation()}>

        <div className="dtl-header">
          <div className="dtl-header-left">
            <h2 className="dtl-title">{t.eventName ?? `Ticket #${t.id}`}</h2>
            {t.localityName && <span className="dtl-subtitle">{t.localityName}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className={`dtl-badge ${badge.cls}`}>{badge.label}</span>
            <button type="button" className="dtl-close" onClick={onClose} aria-label="Close">×</button>
          </div>
        </div>

        <div className="dtl-body">
          {/* QR code — the centrepiece */}
          <div className="dtl-qr-section">
            <div className="dtl-qr-wrap">
              <QRCode value={t.qrCode} size={176} />
            </div>
            <p className="dtl-ticket-code">{t.ticketCode}</p>
            <p className="dtl-qr-hint">Present this QR code at the venue entrance</p>
          </div>

          <div className="dtl-fields">
            {seatLabel && <Field label="Seat"       value={`Row ${t.rowLabel} · Seat ${t.seatNumber}`} />}
            <Field label="Reservation" value={`#${t.reservationId}`} />
            <Field label="Issued"      value={fmt(t.issuedAt)} />
            {t.status === 'USED' && (
              <>
                <Field label="Used at"       value={fmt(t.usedAt)} />
                <Field label="Validated by"  value={t.validatedByName} />
                <Field label="Validated at"  value={fmt(t.validatedAt)} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
