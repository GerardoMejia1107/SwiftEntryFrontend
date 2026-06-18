import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ConsumerLayout from '../../components/dashboardLayout/ConsumerLayout';
import { useConsumerEvents } from '../../hooks/useEvents';
import './ConsumerEventsPage.css';

const PinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

const CalIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const SeatsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 17v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h8v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2" />
    <path d="M4 17H2v-5a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v5h-2" />
    <rect x="6" y="9" width="12" height="8" rx="1" />
  </svg>
);

const TagIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const STATUS_LABEL = {
  PUBLISHED: null,
  CANCELLED: 'Cancelled',
  FINISHED:  'Finished',
};

const formatDate = (iso) => {
  if (!iso) return null;
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const minPrice = (localities) => {
  if (!Array.isArray(localities) || localities.length === 0) return null;
  const prices = localities.map(l => Number(l.price ?? 0)).filter(p => p > 0);
  return prices.length > 0 ? Math.min(...prices) : null;
};

function EventCard({ event, onSelectSeats }) {
  const isActive = event.status === 'PUBLISHED';
  const statusLabel = STATUS_LABEL[event.status];
  const date = formatDate(event.startDate);
  const price = minPrice(event.localities);

  return (
    <div className={`consumer-event-card ${!isActive ? 'consumer-event-card--inactive' : ''}`}>

      {event.imageUrl ? (
        <div className="consumer-event-card-image">
          <img src={event.imageUrl} alt={event.name} />
          {event.category && (
            <span className="consumer-event-type consumer-event-type--over">{event.category}</span>
          )}
        </div>
      ) : (
        <div className="consumer-event-card-top">
          {event.category && (
            <span className="consumer-event-type">{event.category}</span>
          )}
        </div>
      )}

      <div className="consumer-event-card-body">
        <h3 className="consumer-event-name">{event.name}</h3>
        {event.description && (
          <p className="consumer-event-desc">{event.description}</p>
        )}
        {event.venueName && (
          <div className="consumer-event-meta">
            <PinIcon />
            {event.venueName}
          </div>
        )}
        {date && (
          <div className="consumer-event-meta">
            <CalIcon />
            {date}
          </div>
        )}
        {price !== null && (
          <div className="consumer-event-meta consumer-event-price">
            <TagIcon />
            From <strong>${price.toFixed(2)}</strong>
          </div>
        )}
      </div>

      <div className="consumer-event-card-footer">
        {statusLabel && (
          <span className={`consumer-event-status consumer-event-status--${event.status.toLowerCase()}`}>
            {statusLabel}
          </span>
        )}
        <button
          className="consumer-event-seats-btn"
          onClick={() => onSelectSeats(event)}
          disabled={!isActive}
        >
          <SeatsIcon />
          Select Seats
        </button>
      </div>
    </div>
  );
}

export default function ConsumerEventsPage() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const { events, loading, error } = useConsumerEvents();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <ConsumerLayout user={auth?.user} activeItem="events" onLogout={handleLogout}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1280, margin: '0 auto' }}>
        <header style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
            Events
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
            Browse available events and select your seats.
          </p>
        </header>

        {loading && (
          <div className="consumer-events-state">
            <span className="consumer-events-spinner" />
            <p>Loading events…</p>
          </div>
        )}

        {!loading && error && (
          <div className="consumer-events-state consumer-events-state--error">
            <p>Could not load events. Please try again later.</p>
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="consumer-events-state">
            <p>No events available right now. Check back soon!</p>
          </div>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="consumer-events-grid">
            {events.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onSelectSeats={(ev) => navigate(`/home-consumer/events/${ev.id}/seats`, { state: { event: ev } })}
              />
            ))}
          </div>
        )}
      </div>
    </ConsumerLayout>
  );
}
