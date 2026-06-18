import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import OrganizerLayout from '../../components/dashboardLayout/OrganizerLayout';
import StatCard from '../homeAdmin/sections/StatCard';
import { useOrganizerEvents } from '../../hooks/useEvents';
import { useOrganizerReservations } from '../../hooks/useReservations';
import '../homeAdmin/sections/StatsRow.css';
import '../homeAdmin/AdminHomePage.css';
import '../homeAdmin/EventsPage.css';
import '../homeAdmin/ReservationsPage.css';
import './OrganizerHomePage.css';

const STATUS_BADGE = {
  PENDING:   { label: 'Pending',   cls: 'rsv-badge--pending'   },
  CONFIRMED: { label: 'Confirmed', cls: 'rsv-badge--confirmed' },
  EXPIRED:   { label: 'Expired',   cls: 'rsv-badge--expired'   },
  CANCELLED: { label: 'Cancelled', cls: 'rsv-badge--cancelled' },
  REFUNDED:  { label: 'Refunded',  cls: 'rsv-badge--refunded'  },
};

const EventsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const PublishedIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ReservationsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
    <path d="M13 5v14" strokeDasharray="2 2" />
  </svg>
);

const RevenueIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function OrganizerHomePage() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const { events, loading: eventsLoading }             = useOrganizerEvents(auth?.user?.id);
  const { reservations, loading: reservationsLoading } = useOrganizerReservations();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const publishedCount = useMemo(
    () => events.filter(e => e.status === 'PUBLISHED').length,
    [events]
  );

  const confirmedRevenue = useMemo(
    () => reservations
      .filter(r => r.status === 'CONFIRMED')
      .reduce((sum, r) => sum + Number(r.totalAmount ?? 0), 0),
    [reservations]
  );

  const recentReservations = useMemo(
    () => [...reservations]
      .sort((a, b) => new Date(b.reservedAt) - new Date(a.reservedAt))
      .slice(0, 5),
    [reservations]
  );

  const loading = eventsLoading || reservationsLoading;

  return (
    <OrganizerLayout user={auth?.user} activeItem="dashboard" onLogout={handleLogout}>
      <div className="admin-page">
        <header className="admin-page-header">
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">
            Welcome back{auth?.user?.name ? `, ${auth.user.name}` : ''}. Here's an overview of your events.
          </p>
        </header>

        {/* Stats row */}
        <section className="stats-row org-stats-row">
          <StatCard
            label="My Events"
            value={eventsLoading ? '—' : events.length}
            icon={<EventsIcon />}
            loading={eventsLoading}
            trend={{ direction: 'up', value: 'Total', bars: [50, 60, 55, 70, 65, 80] }}
          />
          <StatCard
            label="Published"
            value={eventsLoading ? '—' : publishedCount}
            icon={<PublishedIcon />}
            loading={eventsLoading}
            trend={{ direction: 'up', value: 'Live now', bars: [40, 55, 50, 65, 70, 75] }}
          />
          <StatCard
            label="Reservations"
            value={reservationsLoading ? '—' : reservations.length}
            icon={<ReservationsIcon />}
            loading={reservationsLoading}
            trend={{ direction: 'up', value: 'All time', bars: [30, 50, 45, 65, 60, 85] }}
          />
          <StatCard
            label="Confirmed Revenue"
            value={reservationsLoading ? '—' : `$${confirmedRevenue.toFixed(2)}`}
            icon={<RevenueIcon />}
            loading={reservationsLoading}
            trend={{ direction: 'up', value: 'Confirmed', bars: [40, 55, 60, 70, 65, 90] }}
          />
        </section>

        {/* Recent reservations */}
        <div className="ev-card">
          <div className="org-section-header">
            <span className="org-section-title">Recent Reservations</span>
            <button
              className="org-view-all-btn"
              onClick={() => navigate('/home-organizer/reservations')}
            >
              View all
            </button>
          </div>

          {loading && (
            <div className="ev-state">
              <span className="ev-spinner" />
              <p className="ev-state-text">Loading…</p>
            </div>
          )}

          {!loading && recentReservations.length === 0 && (
            <div className="ev-state">
              <p className="ev-state-text">No reservations yet for your events.</p>
            </div>
          )}

          {!loading && recentReservations.length > 0 && (
            <div className="ev-table-wrap">
              <table className="ev-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Seats</th>
                    <th>Total</th>
                    <th>Reserved At</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReservations.map(r => {
                    const badge = STATUS_BADGE[r.status] ?? { label: r.status, cls: '' };
                    return (
                      <tr key={r.id} className="ev-row" onClick={() => navigate('/home-organizer/reservations')}>
                        <td className="ev-col-id">#{r.id}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className="usr-avatar-sm" style={{ width: 26, height: 26, fontSize: 11 }}>
                              {(r.userName ?? '?').charAt(0).toUpperCase()}
                            </span>
                            <span style={{ fontWeight: 600, fontSize: 13 }}>{r.userName || '—'}</span>
                          </div>
                        </td>
                        <td><span className={`rsv-badge ${badge.cls}`}>{badge.label}</span></td>
                        <td style={{ fontSize: 13 }}>{Array.isArray(r.reservationSeats) ? r.reservationSeats.length : 0}</td>
                        <td style={{ fontWeight: 700, fontSize: 13 }}>${Number(r.totalAmount ?? 0).toFixed(2)}</td>
                        <td className="ev-col-date">{formatDate(r.reservedAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </OrganizerLayout>
  );
}
