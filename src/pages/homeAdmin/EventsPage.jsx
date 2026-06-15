import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/dashboardLayout/DashboardLayout';
import { getAllEvents } from '../../api/eventService';
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

export default function EventsPage() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);

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
          {/* Loading */}
          {loading && (
            <div className="ev-state">
              <span className="ev-spinner" />
              <p className="ev-state-text">Loading events…</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="ev-state ev-state--error">
              <p className="ev-state-text">{error}</p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && events.length === 0 && (
            <div className="ev-state">
              <p className="ev-state-text">No events found.</p>
            </div>
          )}

          {/* Table */}
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </DashboardLayout>
  );
}
