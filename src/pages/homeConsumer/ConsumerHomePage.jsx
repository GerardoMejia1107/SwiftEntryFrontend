import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ConsumerLayout from '../../components/dashboardLayout/ConsumerLayout';
import { useMyReservations } from '../../hooks/useReservations';
import './ConsumerHomePage.css';
import './ConsumerReservationsPage.css';

const STATUS_META = {
  PENDING:   { label: 'Pending',   cls: 'rsv-status--pending'   },
  CONFIRMED: { label: 'Confirmed', cls: 'rsv-status--confirmed' },
  EXPIRED:   { label: 'Expired',   cls: 'rsv-status--expired'   },
  CANCELLED: { label: 'Cancelled', cls: 'rsv-status--cancelled' },
  REFUNDED:  { label: 'Refunded',  cls: 'rsv-status--refunded'  },
};

const TicketIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
    <path d="M13 5v14" strokeDasharray="2 2" />
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const money = (val) => `$${Number(val ?? 0).toFixed(2)}`;

function StatPill({ label, value, icon, color, bg }) {
  return (
    <div className="ch-stat-pill" style={{ '--pill-color': color, '--pill-bg': bg }}>
      <span className="ch-stat-pill-icon">{icon}</span>
      <div className="ch-stat-pill-body">
        <span className="ch-stat-pill-value">{value}</span>
        <span className="ch-stat-pill-label">{label}</span>
      </div>
    </div>
  );
}

export default function ConsumerHomePage() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const { reservations, loading } = useMyReservations();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const confirmed = useMemo(() => reservations.filter(r => r.status === 'CONFIRMED').length, [reservations]);
  const pending   = useMemo(() => reservations.filter(r => r.status === 'PENDING').length,   [reservations]);

  const recent = useMemo(
    () => [...reservations]
      .sort((a, b) => new Date(b.reservedAt) - new Date(a.reservedAt))
      .slice(0, 3),
    [reservations]
  );

  return (
    <ConsumerLayout user={auth?.user} activeItem="home" onLogout={handleLogout}>
      <div className="ch-page">

        {/* Welcome header */}
        <header className="ch-header">
          <div>
            <h1 className="ch-title">
              Welcome back{auth?.user?.name ? `, ${auth.user.name}` : ''}!
            </h1>
            <p className="ch-subtitle">Here's a summary of your reservations.</p>
          </div>
          <button className="ch-browse-btn" onClick={() => navigate('/home-consumer/events')}>
            Browse Events
          </button>
        </header>

        {/* Stats pills */}
        <div className="ch-stats-row">
          <StatPill
            label="Total Reservations"
            value={loading ? '—' : reservations.length}
            icon={<TicketIcon />}
            color="#6D28D9"
            bg="#EDE9FE"
          />
          <StatPill
            label="Confirmed"
            value={loading ? '—' : confirmed}
            icon={<CheckIcon />}
            color="#15803D"
            bg="#DCFCE7"
          />
          <StatPill
            label="Pending"
            value={loading ? '—' : pending}
            icon={<ClockIcon />}
            color="#B45309"
            bg="#FEF3C7"
          />
        </div>

        {/* Recent reservations */}
        <div className="ch-section">
          <div className="ch-section-head">
            <span className="ch-section-title">Recent Reservations</span>
            {reservations.length > 3 && (
              <button className="ch-view-all" onClick={() => navigate('/home-consumer/reservations')}>
                View all
              </button>
            )}
          </div>

          {loading && (
            <div className="ch-empty">
              <span className="ch-spinner" />
              <p>Loading…</p>
            </div>
          )}

          {!loading && reservations.length === 0 && (
            <div className="ch-empty">
              <p>No reservations yet.</p>
              <button className="ch-empty-cta" onClick={() => navigate('/home-consumer/events')}>
                Find an event
              </button>
            </div>
          )}

          {!loading && recent.length > 0 && (
            <div className="ch-recent-list">
              {recent.map(r => {
                const meta   = STATUS_META[r.status] ?? { label: r.status, cls: '' };
                const seats  = Array.isArray(r.reservationSeats) ? r.reservationSeats.length : 0;
                return (
                  <div key={r.id} className="ch-recent-card">
                    <div className="ch-recent-top">
                      <span className="ch-recent-id">Reservation #{r.id}</span>
                      <span className={`rsv-status-badge ${meta.cls}`}>{meta.label}</span>
                    </div>
                    <div className="ch-recent-row">
                      <span className="ch-recent-label">Seats</span>
                      <span className="ch-recent-value">{seats}</span>
                    </div>
                    <div className="ch-recent-row">
                      <span className="ch-recent-label">Total</span>
                      <span className="ch-recent-value ch-recent-total">{money(r.totalAmount)}</span>
                    </div>
                    <div className="ch-recent-row">
                      <span className="ch-recent-label">Date</span>
                      <span className="ch-recent-value">{formatDate(r.reservedAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </ConsumerLayout>
  );
}
