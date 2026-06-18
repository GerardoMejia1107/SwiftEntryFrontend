import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import OrganizerLayout from '../../components/dashboardLayout/OrganizerLayout';
import { useOrganizerEvents } from '../../hooks/useEvents';
import EventDetailModal from '../homeAdmin/sections/EventDetailModal';
import '../homeAdmin/AdminHomePage.css';
import '../homeAdmin/EventsPage.css';

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

export default function OrganizerEventsPage() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState(null);

  const { events, loading, error } = useOrganizerEvents(auth?.user?.id);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleManageSeats = (e, ev) => {
    e.stopPropagation();
    navigate('/home-organizer/seats', { state: { event: ev } });
  };

  return (
    <OrganizerLayout user={auth?.user} activeItem="events" onLogout={handleLogout}>
      <div className="admin-page">
        <header className="admin-page-header">
          <h1 className="admin-page-title">My Events</h1>
          <p className="admin-page-subtitle">Events assigned to your organizer account.</p>
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
                    <th>Actions</th>
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
                      <td>
                        <button
                          className="ev-seats-btn"
                          onClick={(e) => handleManageSeats(e, ev)}
                          title="Manage seat map for this event"
                        >
                          Manage Seats
                        </button>
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
    </OrganizerLayout>
  );
}
