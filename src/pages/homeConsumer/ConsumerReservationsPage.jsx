import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useReservation } from '../../context/ReservationContext';
import ConsumerLayout from '../../components/dashboardLayout/ConsumerLayout';
import { useMyReservations } from '../../hooks/useReservations';
import ReservationDetailModal from '../homeAdmin/sections/ReservationDetailModal';
import PaymentModal from './sections/PaymentModal';
import '../homeAdmin/EventsPage.css';
import '../homeAdmin/ReservationsPage.css';
import '../homeAdmin/UsersPage.css';
import './ConsumerReservationsPage.css';

const STATUS_BADGE = {
  PENDING:   { label: 'Pending',   cls: 'rsv-badge--pending'   },
  CONFIRMED: { label: 'Confirmed', cls: 'rsv-badge--confirmed' },
  EXPIRED:   { label: 'Expired',   cls: 'rsv-badge--expired'   },
  CANCELLED: { label: 'Cancelled', cls: 'rsv-badge--cancelled' },
  REFUNDED:  { label: 'Refunded',  cls: 'rsv-badge--refunded'  },
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

const formatAmount = (val) => {
  if (val == null) return '—';
  return `$${Number(val).toFixed(2)}`;
};

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default function ConsumerReservationsPage() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const { reservations, loading, error, refetch } = useMyReservations();
  const { clearActiveReservation } = useReservation();

  const [selected, setSelected]         = useState(null);
  const [payingReservation, setPayingReservation] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch]             = useState('');

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

  const handlePay = (e, r) => {
    e.stopPropagation();
    setPayingReservation(r);
  };

  const visible = useMemo(() => {
    let result = [...reservations];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((r) => String(r.id).includes(q));
    }

    if (statusFilter !== 'all') {
      result = result.filter((r) => r.status === statusFilter);
    }

    result.sort((a, b) => b.id - a.id);
    return result;
  }, [reservations, search, statusFilter]);

  return (
    <ConsumerLayout user={auth?.user} activeItem="reservations" onLogout={handleLogout}>
      <div className="crsv-page">
        <header className="crsv-header">
          <h1 className="crsv-title">My Reservations</h1>
          <p className="crsv-subtitle">All your current and past reservations.</p>
        </header>

        <div className="ev-card">
          <div className="usr-toolbar">
            <div className="usr-search-wrap">
              <span className="usr-search-icon"><SearchIcon /></span>
              <input
                type="text"
                className="usr-search"
                placeholder="Search by reservation ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="usr-toolbar-right">
              <select
                className="usr-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All statuses</option>
                {Object.keys(STATUS_BADGE).map((s) => (
                  <option key={s} value={s}>{STATUS_BADGE[s].label}</option>
                ))}
              </select>
            </div>
          </div>

          {loading && (
            <div className="ev-state">
              <span className="ev-spinner" />
              <p className="ev-state-text">Loading your reservations…</p>
            </div>
          )}

          {!loading && error && (
            <div className="ev-state ev-state--error">
              <p className="ev-state-text">Could not load reservations. Please try again later.</p>
            </div>
          )}

          {!loading && !error && reservations.length === 0 && (
            <div className="ev-state">
              <p className="ev-state-text">You have no reservations yet. Browse events to get started!</p>
            </div>
          )}

          {!loading && !error && reservations.length > 0 && (
            <>
              {visible.length === 0 ? (
                <div className="ev-state">
                  <p className="ev-state-text">No reservations match your filter.</p>
                </div>
              ) : (
                <div className="ev-table-wrap">
                  <table className="ev-table">
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>Seats</th>
                        <th>Total</th>
                        <th>Reserved on</th>
                        <th>Timeline</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {visible.map((r) => {
                        const badge = STATUS_BADGE[r.status] ?? { label: r.status, cls: '' };
                        const isExpired = r.expiresAt && new Date(r.expiresAt) < new Date();
                        const canPay = r.status === 'PENDING' && !isExpired;

                        let timeline;
                        if (r.status === 'PENDING')   timeline = `Expires ${formatDate(r.expiresAt)}`;
                        else if (r.status === 'CONFIRMED') timeline = `Paid ${formatDate(r.purchasedAt)}`;
                        else if (r.status === 'EXPIRED')   timeline = `Expired ${formatDate(r.expiresAt)}`;
                        else timeline = '—';

                        return (
                          <tr key={r.id} className="ev-row" onClick={() => setSelected(r)}>
                            <td>
                              <span className={`rsv-badge ${badge.cls}`}>{badge.label}</span>
                            </td>
                            <td>{Array.isArray(r.reservationSeats) ? r.reservationSeats.length : 0}</td>
                            <td style={{ fontWeight: 700 }}>{formatAmount(r.totalAmount)}</td>
                            <td className="ev-col-date">{formatDate(r.reservedAt)}</td>
                            <td className="ev-col-date">{timeline}</td>
                            <td className="ev-col-actions" onClick={(e) => e.stopPropagation()}>
                              {canPay && (
                                <button
                                  type="button"
                                  className="crsv-pay-btn"
                                  onClick={(e) => handlePay(e, r)}
                                >
                                  Pay now
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        {!loading && !error && reservations.length > 0 && (
          <p className="usr-count">
            Showing {visible.length} of {reservations.length} reservations
          </p>
        )}
      </div>

      {selected && (
        <ReservationDetailModal
          reservation={selected}
          variant="consumer"
          onClose={() => setSelected(null)}
        />
      )}

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
