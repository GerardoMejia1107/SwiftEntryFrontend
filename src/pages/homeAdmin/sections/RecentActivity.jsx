import './Panel.css';
import './RecentActivity.css';

const CartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const CalendarCheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4" />
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

// Datos de muestra (placeholder): el backend no expone un feed de actividad.
const ACTIVITY = [
  {
    id: 1,
    icon: CartIcon,
    tone: 'purple',
    title: 'New Ticket Purchase',
    time: '2m ago',
    text: "User #8291 purchased 4 tickets for 'Electric Dreams Tour'. Total: $540.00",
  },
  {
    id: 2,
    icon: ShieldIcon,
    tone: 'red',
    title: 'Failed Login Attempt',
    time: '15m ago',
    text: '3 failed attempts from IP 192.168.1.4 (London, UK). Account: admin_root.',
  },
  {
    id: 3,
    icon: CalendarCheckIcon,
    tone: 'green',
    title: 'Event Published',
    time: '1h ago',
    text: "'Summer Jazz Night' has been approved and is now live on the marketplace.",
  },
  {
    id: 4,
    icon: ClockIcon,
    tone: 'blue',
    title: 'System Update',
    time: '4h ago',
    text: 'Payout engine updated to v2.4.1 for faster settlements.',
  },
];

export default function RecentActivity() {
  return (
    <div className="panel activity">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Recent Activity</h2>
          <p className="panel-subtitle">System-wide logs and updates.</p>
        </div>
      </div>

      <ul className="activity-list">
        {ACTIVITY.map(({ id, icon: Icon, tone, title, time, text }) => (
          <li key={id} className="activity-item">
            <span className={`activity-icon activity-icon--${tone}`}>
              <Icon />
            </span>
            <div className="activity-body">
              <div className="activity-head">
                <span className="activity-title">{title}</span>
                <span className="activity-time">{time}</span>
              </div>
              <p className="activity-text">{text}</p>
            </div>
          </li>
        ))}
      </ul>

      <button type="button" className="activity-clear">Clear All Logs</button>
    </div>
  );
}
