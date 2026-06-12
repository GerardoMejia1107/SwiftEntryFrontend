import './Panel.css';
import './FlaggedEventsTable.css';

const KebabIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="1.6" />
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="12" cy="19" r="1.6" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// Datos de muestra (placeholder): el backend no maneja "eventos marcados".
const FLAGGED_EVENTS = [
  {
    id: 1,
    name: 'Neon Horizon Fest',
    location: 'London, UK',
    organizer: 'Skyline Promos',
    risk: 'high',
    riskLabel: 'High Risk',
    reason: 'Duplicate Merchant ID',
  },
  {
    id: 2,
    name: 'Global Tech Summit',
    location: 'San Francisco, CA',
    organizer: 'Vertex Events',
    risk: 'medium',
    riskLabel: 'Medium',
    reason: 'Price Anomaly (<300%)',
  },
  {
    id: 3,
    name: 'Phantom Opera Tour',
    location: 'New York, NY',
    organizer: 'Majestic Arts',
    risk: 'low',
    riskLabel: 'Low',
    reason: 'Incomplete Documentation',
  },
];

function initialsOf(name = '') {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

export default function FlaggedEventsTable() {
  return (
    <div className="panel flagged">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Flagged Events</h2>
          <p className="panel-subtitle">
            Events requiring manual verification or risk assessment.
          </p>
        </div>
        <button type="button" className="panel-link">View All</button>
      </div>

      <div className="flagged-table-wrap">
        <table className="flagged-table">
          <thead>
            <tr>
              <th>Event Details</th>
              <th>Organizer</th>
              <th>Risk Level</th>
              <th>Flag Reason</th>
              <th className="flagged-col-action">Action</th>
            </tr>
          </thead>
          <tbody>
            {FLAGGED_EVENTS.map((ev) => (
              <tr key={ev.id}>
                <td>
                  <div className="flagged-event">
                    <span className="flagged-event-avatar">{initialsOf(ev.name)}</span>
                    <div className="flagged-event-text">
                      <span className="flagged-event-name">{ev.name}</span>
                      <span className="flagged-event-location">{ev.location}</span>
                    </div>
                  </div>
                </td>
                <td className="flagged-organizer">{ev.organizer}</td>
                <td>
                  <span className={`risk-badge risk-badge--${ev.risk}`}>{ev.riskLabel}</span>
                </td>
                <td className="flagged-reason">{ev.reason}</td>
                <td className="flagged-col-action">
                  <button type="button" className="flagged-kebab" aria-label="Acciones">
                    <KebabIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button type="button" className="flagged-load-more">
        Load More Data
        <ChevronDownIcon />
      </button>
    </div>
  );
}
