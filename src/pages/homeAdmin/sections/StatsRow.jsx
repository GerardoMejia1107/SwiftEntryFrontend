import { useEffect, useState } from 'react';
import StatCard from './StatCard';
import { getEvents as getAllEvents } from '../../../api/events';
import './StatsRow.css';

const RevenueIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const UsersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const EventsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

export default function StatsRow() {
  const [eventCount, setEventCount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getAllEvents()
      .then((events) => {
        if (active) setEventCount(Array.isArray(events) ? events.length : 0);
      })
      .catch(() => {
        if (active) setEventCount(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return (
    <section className="stats-row">
      {/* Ingresos y usuarios son placeholders: aún no hay endpoint en el backend. */}
      <StatCard
        label="Total Revenue"
        value="$1,284,590"
        icon={<RevenueIcon />}
        trend={{ direction: 'up', value: '+12.4%', bars: [40, 60, 50, 75, 65, 90] }}
      />
      <StatCard
        label="Active Users"
        value="42.8k"
        icon={<UsersIcon />}
        trend={{ direction: 'up', value: '+8.1%', bars: [50, 45, 65, 55, 80, 70] }}
      />
      <StatCard
        label="Total Events"
        value={eventCount ?? '—'}
        icon={<EventsIcon />}
        loading={loading}
        trend={{ direction: 'up', value: 'En vivo', bars: [60, 70, 55, 80, 75, 95] }}
      />
    </section>
  );
}
