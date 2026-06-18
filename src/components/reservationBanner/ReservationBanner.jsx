import { useState, useEffect } from 'react';
import { useReservation } from '../../context/ReservationContext';
import './ReservationBanner.css';

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function ReservationBanner() {
  const { activeReservation, clearActiveReservation } = useReservation();

  const [secs, setSecs] = useState(() =>
    activeReservation
      ? Math.max(0, Math.floor((new Date(activeReservation.expiresAt) - Date.now()) / 1000))
      : 0
  );

  // Re-sync when a new reservation is set (e.g. coming back from seat selection)
  useEffect(() => {
    if (!activeReservation) return;
    setSecs(Math.max(0, Math.floor((new Date(activeReservation.expiresAt) - Date.now()) / 1000)));
  }, [activeReservation]);

  useEffect(() => {
    if (!activeReservation || secs <= 0) return;
    const id = setInterval(() => {
      setSecs(s => {
        if (s <= 1) {
          clearInterval(id);
          clearActiveReservation();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [activeReservation, clearActiveReservation]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!activeReservation || secs <= 0) return null;

  const mins = Math.floor(secs / 60);
  const seconds = secs % 60;
  const tone = secs < 60 ? 'danger' : secs < 180 ? 'warn' : 'ok';
  const timeStr = `${String(mins).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className={`rsv-banner${tone !== 'ok' ? ` rsv-banner--${tone}` : ''}`}>
      <div className="rsv-banner-left">
        <span className="rsv-banner-icon">⏱</span>
        <span className="rsv-banner-text">
          Reservation pending — expires in
          <span className="rsv-banner-time">{timeStr}</span>
        </span>
      </div>
      <button
        type="button"
        className="rsv-banner-dismiss"
        onClick={clearActiveReservation}
        aria-label="Dismiss"
      >
        <XIcon />
      </button>
    </div>
  );
}
