import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/dashboardLayout/DashboardLayout';
import { useAllReservations } from '../../hooks/useReservations';
import './AdminHomePage.css';
import './EventsPage.css';
import './UsersPage.css';
import './ReservationsPage.css';

const STATUS_BADGE = {
  PENDING:   { label: 'Pending',   cls: 'rsv-badge--pending'   },
  CONFIRMED: { label: 'Confirmed', cls: 'rsv-badge--confirmed' },
  EXPIRED:   { label: 'Expired',   cls: 'rsv-badge--expired'   },
  CANCELLED: { label: 'Cancelled', cls: 'rsv-badge--cancelled' },
  REFUNDED:  { label: 'Refunded',  cls: 'rsv-badge--refunded'  },
};

const SORT_FIELDS = [
  { value: 'id',         label: 'ID'     },
  { value: 'user',       label: 'User'   },
  { value: 'status',     label: 'Status' },
  { value: 'total',      label: 'Total'  },
  { value: 'reservedAt', label: 'Date'   },
];

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const SortAscIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);

const SortDescIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12l7 7 7-7" />
  </svg>
);

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

export default function ReservationsPage() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const { reservations, loading, error } = useAllReservations();

  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField]     = useState('id');
  const [sortAsc, setSortAsc]         = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const visible = useMemo(() => {
    let result = [...reservations];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((r) =>
        (r.userName ?? '').toLowerCase().includes(q) ||
        (r.userEmail ?? '').toLowerCase().includes(q) ||
        String(r.id).includes(q)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((r) => r.status === statusFilter);
    }

    result.sort((a, b) => {
      let av, bv;
      if (sortField === 'id')         { return sortAsc ? a.id - b.id : b.id - a.id; }
      if (sortField === 'total')      { av = Number(a.totalAmount ?? 0); bv = Number(b.totalAmount ?? 0); return sortAsc ? av - bv : bv - av; }
      if (sortField === 'reservedAt') { av = a.reservedAt ?? ''; bv = b.reservedAt ?? ''; }
      if (sortField === 'user')       { av = (a.userName ?? '').toLowerCase(); bv = (b.userName ?? '').toLowerCase(); }
      if (sortField === 'status')     { av = a.status ?? ''; bv = b.status ?? ''; }
      if (av < bv) return sortAsc ? -1 : 1;
      if (av > bv) return sortAsc ?  1 : -1;
      return 0;
    });

    return result;
  }, [reservations, search, statusFilter, sortField, sortAsc]);

  const toggleSort = (field) => {
    if (sortField === field) setSortAsc((v) => !v);
    else { setSortField(field); setSortAsc(true); }
  };

  return (
    <DashboardLayout
      user={auth?.user}
      activeItem="reservations"
      onLogout={handleLogout}
    >
      <div className="admin-page">
        <header className="admin-page-header">
          <h1 className="admin-page-title">All Reservations</h1>
          <p className="admin-page-subtitle">Every reservation on the platform.</p>
        </header>

        <div className="ev-card">
          <div className="usr-toolbar">
            <div className="usr-search-wrap">
              <span className="usr-search-icon"><SearchIcon /></span>
              <input
                type="text"
                className="usr-search"
                placeholder="Search by name, email or ID…"
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

              <div className="usr-sort-group">
                <span className="usr-sort-label">Sort by</span>
                {SORT_FIELDS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    className={`usr-sort-btn ${sortField === value ? 'usr-sort-btn--active' : ''}`}
                    onClick={() => toggleSort(value)}
                  >
                    {label}
                    {sortField === value && (
                      <span className="usr-sort-arrow">
                        {sortAsc ? <SortAscIcon /> : <SortDescIcon />}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading && (
            <div className="ev-state">
              <span className="ev-spinner" />
              <p className="ev-state-text">Loading reservations…</p>
            </div>
          )}

          {!loading && error && (
            <div className="ev-state ev-state--error">
              <p className="ev-state-text">Could not load reservations.</p>
            </div>
          )}

          {!loading && !error && reservations.length === 0 && (
            <div className="ev-state">
              <p className="ev-state-text">No reservations found.</p>
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
                        <th>ID</th>
                        <th>User</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Seats</th>
                        <th>Total</th>
                        <th>Reserved At</th>
                        <th>Expires At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visible.map((r) => {
                        const badge = STATUS_BADGE[r.status] ?? { label: r.status, cls: '' };
                        return (
                          <tr key={r.id} className="ev-row">
                            <td className="ev-col-id">#{r.id}</td>
                            <td className="usr-col-name">
                              <div className="usr-name-cell">
                                <span className="usr-avatar-sm">
                                  {(r.userName ?? '?').charAt(0).toUpperCase()}
                                </span>
                                {r.userName || '—'}
                              </div>
                            </td>
                            <td className="usr-col-email">{r.userEmail || '—'}</td>
                            <td>
                              <span className={`rsv-badge ${badge.cls}`}>{badge.label}</span>
                            </td>
                            <td>{Array.isArray(r.reservationSeats) ? r.reservationSeats.length : 0}</td>
                            <td style={{ fontWeight: 700 }}>{formatAmount(r.totalAmount)}</td>
                            <td className="ev-col-date">{formatDate(r.reservedAt)}</td>
                            <td className="ev-col-date">{formatDate(r.expiresAt)}</td>
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
    </DashboardLayout>
  );
}
