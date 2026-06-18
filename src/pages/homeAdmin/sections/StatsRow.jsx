import { useEffect, useState } from 'react';
import StatCard from './StatCard';
import { getEvents as getAllEvents } from '../../../api/events';
import { getUsers } from '../../../api/users';
import { getAllReservations } from '../../../api/reservations';
import './StatsRow.css';

const ReservationsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
    <path d="M13 5v14" strokeDasharray="2 2" />
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

function useCount(fetcher) {
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetcher()
      .then((data) => { if (active) setCount(Array.isArray(data) ? data.length : 0); })
      .catch(() => { if (active) setCount(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [fetcher]);

  return { count, loading };
}

export default function StatsRow() {
  const { count: eventCount, loading: eventsLoading }             = useCount(getAllEvents);
  const { count: userCount, loading: usersLoading }               = useCount(getUsers);
  const { count: reservationCount, loading: reservationsLoading } = useCount(getAllReservations);

  return (
    <section className="stats-row">
      <StatCard
        label="Total Reservations"
        value={reservationCount ?? '—'}
        icon={<ReservationsIcon />}
        loading={reservationsLoading}
        trend={{ direction: 'up', value: 'Live', bars: [40, 60, 50, 75, 65, 90] }}
      />
      <StatCard
        label="Total Users"
        value={userCount ?? '—'}
        icon={<UsersIcon />}
        loading={usersLoading}
        trend={{ direction: 'up', value: 'Live', bars: [50, 45, 65, 55, 80, 70] }}
      />
      <StatCard
        label="Total Events"
        value={eventCount ?? '—'}
        icon={<EventsIcon />}
        loading={eventsLoading}
        trend={{ direction: 'up', value: 'Live', bars: [60, 70, 55, 80, 75, 95] }}
      />
    </section>
  );
}
