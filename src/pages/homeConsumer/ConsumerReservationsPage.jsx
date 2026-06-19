import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useReservation } from '../../context/ReservationContext';
import ConsumerLayout from '../../components/dashboardLayout/ConsumerLayout';
import { useMyReservations } from '../../hooks/useReservations';
import PaymentModal from './sections/PaymentModal';
import './ConsumerReservationsPage.css';

const STATUS_META = {
  PENDING:   { label: 'Pending',   cls: 'rsv-status--pending'   },
  CONFIRMED: { label: 'Confirmed', cls: 'rsv-status--confirmed' },
  EXPIRED:   { label: 'Expired',   cls: 'rsv-status--expired'   },
  CANCELLED: { label: 'Cancelled', cls: 'rsv-status--cancelled' },
  REFUNDED:  { label: 'Refunded',  cls: 'rsv-status--refunded'  },
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const formatAmount = (val) => {
  if (val == null) return '—';
  return `$${Number(val).toFixed(2)}`;
};

function ReservationCard({ reservation: r, onPay }) {
  const meta = STATUS_META[r.status] ?? { label: r.status, cls: '' };
  const seatCount = Array.isArray(r.reservationSeats) ? r.reservationSeats.length : 0;
  const isExpired = r.expiresAt && new Date(r.expiresAt) < new Date();
  const canPay = r.status === 'PENDING' && !isExpired;

  return (
    <div className="rsv-card">
      <div className="rsv-card-header">
        <span className="rsv-card-id">Reservation #{r.id}</span>
        <span className={`rsv-status-badge ${meta.cls}`}>{meta.label}</span>
      </div>

      <div className="rsv-card-body">
        <div className="rsv-row">
          <span className="rsv-row-label">Seats</span>
          <span className="rsv-row-value">{seatCount}</span>
        </div>
        <div className="rsv-row">
          <span className="rsv-row-label">Subtotal</span>
          <span className="rsv-row-value">{formatAmount(r.subtotal)}</span>
        </div>
        {Number(r.discountAmount) > 0 && (
          <div className="rsv-row">
            <span className="rsv-row-label">Discount</span>
            <span className="rsv-row-value" style={{ color: '#15803D' }}>−{formatAmount(r.discountAmount)}</span>
          </div>
        )}
        {Number(r.taxAmount) > 0 && (
          <div className="rsv-row">
            <span className="rsv-row-label">Tax</span>
            <span className="rsv-row-value">{formatAmount(r.taxAmount)}</span>
          </div>
        )}
        <div className="rsv-row" style={{ marginTop: 4 }}>
          <span className="rsv-row-label">Total</span>
          <span className="rsv-total">{formatAmount(r.totalAmount)}</span>
        </div>
        <div className="rsv-row">
          <span className="rsv-row-label">Reserved</span>
          <span className="rsv-row-value" style={{ fontWeight: 500, fontSize: 12 }}>{formatDate(r.reservedAt)}</span>
        </div>
        {r.expiresAt && r.status === 'PENDING' && (
          <div className="rsv-row">
            <span className="rsv-row-label">Expires</span>
            <span className="rsv-row-value" style={{ fontWeight: 500, fontSize: 12, color: '#B45309' }}>{formatDate(r.expiresAt)}</span>
          </div>
        )}
      </div>

      {canPay && (
        <div className="rsv-card-footer">
          <button type="button" className="rsv-pay-btn" onClick={() => onPay(r)}>
            Pay now
          </button>
        </div>
      )}

      {r.purchasedAt && (
        <div className="rsv-card-footer">
          Purchased on {formatDate(r.purchasedAt)}
        </div>
      )}
    </div>
  );
}

export default function ConsumerReservationsPage() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const { reservations, loading, error, refetch } = useMyReservations();
  const { clearActiveReservation } = useReservation();
  const [payingReservation, setPayingReservation] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handlePaymentSuccess = (payment) => {
    if (payment?.reservationStatus === 'CONFIRMED') {
      clearActiveReservation();
    }
    setPayingReservation(null);
    refetch();
  };

  return (
    <ConsumerLayout user={auth?.user} activeItem="reservations" onLogout={handleLogout}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1280, margin: '0 auto' }}>
        <header style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
            My Reservations
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
            All your current and past reservations.
          </p>
        </header>

        {loading && (
          <div className="rsv-state">
            <span className="rsv-spinner" />
            <p>Loading your reservations…</p>
          </div>
        )}

        {!loading && error && (
          <div className="rsv-state rsv-state--error">
            <p>Could not load reservations. Please try again later.</p>
          </div>
        )}

        {!loading && !error && reservations.length === 0 && (
          <div className="rsv-state">
            <p>You have no reservations yet. Browse events to get started!</p>
          </div>
        )}

        {!loading && !error && reservations.length > 0 && (
          <div className="rsv-grid">
            {reservations.map((r) => (
              <ReservationCard key={r.id} reservation={r} onPay={setPayingReservation} />
            ))}
          </div>
        )}
      </div>

      {payingReservation && (
        <PaymentModal
          reservation={payingReservation}
          onClose={() => setPayingReservation(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </ConsumerLayout>
  );
}
