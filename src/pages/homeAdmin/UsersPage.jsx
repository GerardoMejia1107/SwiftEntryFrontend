import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/dashboardLayout/DashboardLayout';
import { useUsers } from '../../hooks/useUsers';
import UserDetailModal, { getRoleName } from './sections/UserDetailModal';
import './AdminHomePage.css';
import './UsersPage.css';

const ROLE_CLASS = {
  Admin: 'usr-role--admin',
  Organizer: 'usr-role--organizer',
  User: 'usr-role--user',
};

const SORT_FIELDS = [
  { value: 'id', label: 'ID' },
  { value: 'name', label: 'Name' },
  { value: 'roleId', label: 'Role' },
];

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

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default function UsersPage() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const { users, loading, error } = useUsers();

  const [selectedUser, setSelectedUser] = useState(null);

  // toolbar state
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortField, setSortField] = useState('id');
  const [sortAsc, setSortAsc] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const visibleUsers = useMemo(() => {
    let result = [...users];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((u) => {
        const fullName = `${u.name ?? ''} ${u.lastName ?? ''}`.toLowerCase();
        return fullName.includes(q) || (u.email ?? '').toLowerCase().includes(q);
      });
    }

    if (roleFilter !== 'all') {
      result = result.filter((u) => getRoleName(u) === roleFilter);
    }

    result.sort((a, b) => {
      let av, bv;
      if (sortField === 'id') {
        av = a.id; bv = b.id;
        return sortAsc ? av - bv : bv - av;
      }
      if (sortField === 'name') {
        av = `${a.name ?? ''} ${a.lastName ?? ''}`.toLowerCase();
        bv = `${b.name ?? ''} ${b.lastName ?? ''}`.toLowerCase();
      } else {
        av = getRoleName(a).toLowerCase();
        bv = getRoleName(b).toLowerCase();
      }
      if (av < bv) return sortAsc ? -1 : 1;
      if (av > bv) return sortAsc ? 1 : -1;
      return 0;
    });

    return result;
  }, [users, search, roleFilter, sortField, sortAsc]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortAsc((v) => !v);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <DashboardLayout
      user={auth?.user}
      activeItem="users"
      onLogout={handleLogout}
    >
      <div className="admin-page">
        <header className="admin-page-header">
          <h1 className="admin-page-title">All Users</h1>
          <p className="admin-page-subtitle">Every account on the platform — click a row to see details.</p>
        </header>

        <div className="ev-card">

          {/* ── Toolbar ── */}
          <div className="usr-toolbar">
            <div className="usr-search-wrap">
              <span className="usr-search-icon"><SearchIcon /></span>
              <input
                type="text"
                className="usr-search"
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="usr-toolbar-right">
              <select
                className="usr-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All roles</option>
                <option value="Admin">Admin</option>
                <option value="Organizer">Organizer</option>
                <option value="User">User</option>
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
              <p className="ev-state-text">Loading users…</p>
            </div>
          )}

          {!loading && error && (
            <div className="ev-state ev-state--error">
              <p className="ev-state-text">{error}</p>
            </div>
          )}

          {!loading && !error && users.length === 0 && (
            <div className="ev-state">
              <p className="ev-state-text">No users found.</p>
            </div>
          )}

          {!loading && !error && users.length > 0 && (
            <>
              {visibleUsers.length === 0 ? (
                <div className="ev-state">
                  <p className="ev-state-text">No users match your filter.</p>
                </div>
              ) : (
                <div className="ev-table-wrap">
                  <table className="ev-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Phone</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleUsers.map((u) => {
                        const roleName = getRoleName(u);
                        const fullName = [u.name, u.lastName].filter(Boolean).join(' ') || u.username || '—';
                        return (
                          <tr
                            key={u.id}
                            className="ev-row"
                            onClick={() => setSelectedUser(u)}
                          >
                            <td className="ev-col-id">#{u.id}</td>
                            <td className="usr-col-name">
                              <div className="usr-name-cell">
                                <span className="usr-avatar-sm">
                                  {fullName.charAt(0).toUpperCase()}
                                </span>
                                {fullName}
                              </div>
                            </td>
                            <td className="usr-col-email">{u.email || '—'}</td>
                            <td>
                              <span className={`usr-role-badge ${ROLE_CLASS[roleName] ?? ''}`}>
                                {roleName}
                              </span>
                            </td>
                            <td className="usr-col-phone">{u.phoneNumber || '—'}</td>
                            <td className="ev-col-date">
                              {u.createdAt
                                ? new Date(u.createdAt).toLocaleDateString('es-SV', {
                                  year: 'numeric', month: 'short', day: 'numeric',
                                })
                                : '—'}
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

        {/* Result count */}
        {!loading && !error && users.length > 0 && (
          <p className="usr-count">
            Showing {visibleUsers.length} of {users.length} users
          </p>
        )}
      </div>

      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </DashboardLayout>
  );
}
