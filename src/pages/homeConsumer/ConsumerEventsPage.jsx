import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ConsumerLayout from '../../components/dashboardLayout/ConsumerLayout';
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

const MOCK_EVENTS = [
  {
    id: '1',
    type: 'LIVE CONCERT',
    name: 'Neon Horizon World Tour',
    venue: 'Grand Sphere Arena',
    date: 'Oct 24, 2024 · 8:00 PM',
  },
  {
    id: '2',
    type: 'FESTIVAL',
    name: 'SoundWave Open Air',
    venue: 'City Park Grounds',
    date: 'Nov 5, 2024 · 4:00 PM',
  },
  {
    id: '3',
    type: 'SPORTS',
    name: 'Championship Finals',
    venue: 'National Stadium',
    date: 'Nov 18, 2024 · 7:30 PM',
  },
  {
    id: '4',
    type: 'THEATER',
    name: 'A Midsummer Night\'s Dream',
    venue: 'Royal Arts Theater',
    date: 'Dec 2, 2024 · 6:00 PM',
  },
  {
    id: '5',
    type: 'STAND-UP',
    name: 'Comedy Night Live',
    venue: 'The Laugh Factory',
    date: 'Dec 10, 2024 · 9:00 PM',
  },
  {
    id: '6',
    type: 'LIVE CONCERT',
    name: 'Retro Beats Revival',
    venue: 'Sunset Amphitheater',
    date: 'Jan 14, 2025 · 7:00 PM',
  },
];

export default function ConsumerEventsPage() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

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

        <div className="consumer-events-grid">
          {MOCK_EVENTS.map(event => (
            <div key={event.id} className="consumer-event-card">
              <div className="consumer-event-card-top">
                <span className="consumer-event-type">{event.type}</span>
              </div>
              <div className="consumer-event-card-body">
                <h3 className="consumer-event-name">{event.name}</h3>
                <div className="consumer-event-meta">
                  <PinIcon />
                  {event.venue}
                </div>
                <div className="consumer-event-meta">
                  <CalIcon />
                  {event.date}
                </div>
              </div>
              <div className="consumer-event-card-footer">
                <button
                  className="consumer-event-seats-btn"
                  onClick={() => navigate(`/home-consumer/events/${event.id}/seats`)}
                >
                  <SeatsIcon />
                  Select Seats
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ConsumerLayout>
  );
}
