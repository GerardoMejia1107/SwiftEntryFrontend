import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/dashboardLayout/DashboardLayout';
import { getAllEvents, deleteEvent } from '../../api/eventService';
import EventDetailModal from './sections/EventDetailModal';
import './AdminHomePage.css';
import './EventsPage.css';

const STATUS_CLASS = {
  PUBLISHED: 'ev-badge--published',
  DRAFT: 'ev-badge--draft',
  CANCELLED: 'ev-badge--cancelled',
  FINISHED: 'ev-badge--finished',
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-SV', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const KebabIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="1.6" />
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="12" cy="19" r="1.6" />
  </svg>
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

export default function EventsPage() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // detail modal
  const [selectedEvent, setSelectedEvent] = useState(null);

  // row menu
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuStyle, setMenuStyle] = useState({});

  // delete confirm
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    let cancelled = false;
    getAllEvents()
      .then((data) => { if (!cancelled) setEvents(data); })
      .catch((err) => {
        if (!cancelled)
          setError(err.response?.data?.message ?? 'Error al cargar los eventos.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const openMenu = (e, id) => {
    e.stopPropagation();
    if (openMenuId === id) { setOpenMenuId(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const style = { right: window.innerWidth - rect.right };
    if (window.innerHeight - rect.bottom < 110) {
      style.bottom = window.innerHeight - rect.top + 4;
    } else {
      style.top = rect.bottom + 4;
    }
    setMenuStyle(style);
    setOpenMenuId(id);
  };

  const closeMenu = () => setOpenMenuId(null);

  useEffect(() => {
    if (openMenuId === null) return;
    window.addEventListener('scroll', closeMenu, true);
    return () => window.removeEventListener('scroll', closeMenu, true);
  }, [openMenuId]);

  const handleEditClick = (e, ev) => {
    e.stopPropagation();
    closeMenu();
    navigate(`/home-admin/events/${ev.id}/edit`, { state: { event: ev } });
  };

  const handleDeleteClick = (e, ev) => {
    e.stopPropagation();
    closeMenu();
    setDeleteError('');
    setDeletingEvent(ev);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEvent) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await deleteEvent(deletingEvent.id);
      setEvents((prev) => prev.filter((e) => e.id !== deletingEvent.id));
      setDeletingEvent(null);
    } catch (err) {
      setDeleteError(err.response?.data?.message ?? 'No se pudo eliminar el evento.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <DashboardLayout
      user={auth?.user}
      activeItem="events"
      onLogout={handleLogout}
      onNewEvent={() => navigate('/home-admin/events/new')}
    >
      <div className="admin-page">
        <header className="admin-page-header">
          <h1 className="admin-page-title">Manage Events</h1>
          <p className="admin-page-subtitle">All platform events — click a row to see details.</p>
        </header>

        <div className="ev-card">
          {loading && (
            <div className="ev-state">
              <span className="ev-spinner" />
              <p className="ev-state-text">Loading events…</p>
            </div>
          )}

          {!loading && error && (
            <div className="ev-state ev-state--error">
              <p className="ev-state-text">{error}</p>
            </div>
          )}

          {!loading && !error && events.length === 0 && (
            <div className="ev-state">
              <p className="ev-state-text">No events found.</p>
            </div>
          )}

          {!loading && !error && events.length > 0 && (
            <div className="ev-table-wrap">
              <table className="ev-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Start date</th>
                    <th>End date</th>
                    <th>Status</th>
                    <th className="ev-col-actions-header"></th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev) => (
                    <tr
                      key={ev.id}
                      className="ev-row"
                      onClick={() => setSelectedEvent(ev)}
                    >
                      <td className="ev-col-id">#{ev.id}</td>
                      <td className="ev-col-name">{ev.name}</td>
                      <td className="ev-col-desc">{ev.description || '—'}</td>
                      <td className="ev-col-date">{formatDate(ev.startDate)}</td>
                      <td className="ev-col-date">{formatDate(ev.endDate)}</td>
                      <td>
                        <span className={`ev-badge ${STATUS_CLASS[ev.status] ?? ''}`}>
                          {ev.status}
                        </span>
                      </td>
                      <td className="ev-col-actions" onClick={(e) => e.stopPropagation()}>
                        <div className="ev-menu-wrap">
                          <button
                            type="button"
                            className="ev-kebab"
                            aria-label="Acciones"
                            onClick={(e) => openMenu(e, ev.id)}
                          >
                            <KebabIcon />
                          </button>
                          {openMenuId === ev.id && (
                            <div className="ev-menu" style={menuStyle}>
                              <button
                                type="button"
                                className="ev-menu-item"
                                onClick={(e) => handleEditClick(e, ev)}
                              >
                                <EditIcon /> Edit
                              </button>
                              <button
                                type="button"
                                className="ev-menu-item ev-menu-item--danger"
                                onClick={(e) => handleDeleteClick(e, ev)}
                              >
                                <TrashIcon /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop to close open menu on click-outside */}
      {openMenuId !== null && (
        <div className="ev-menu-backdrop" onClick={closeMenu} />
      )}

      {/* Detail modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {/* Delete confirmation dialog */}
      {deletingEvent && (
        <div className="ev-confirm-overlay" onClick={() => !deleteLoading && setDeletingEvent(null)}>
          <div className="ev-confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <p className="ev-confirm-title">Delete event?</p>
            <p className="ev-confirm-body">
              This action cannot be undone.{' '}
              <span className="ev-confirm-name">&ldquo;{deletingEvent.name}&rdquo;</span>{' '}
              will be permanently deleted.
            </p>
            {deleteError && (
              <p className="ev-confirm-error">{deleteError}</p>
            )}
            <div className="ev-confirm-actions">
              <button
                type="button"
                className="ev-confirm-cancel"
                onClick={() => setDeletingEvent(null)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ev-confirm-delete"
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
