import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { getMyReservations } from '../api/reservations';

const ReservationContext = createContext(null);

const STORAGE_KEY = 'activeReservation';

export function ReservationProvider({ children }) {
  const { auth } = useAuth();

  const [activeReservation, setActiveReservationState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      // Discard if already expired
      if (new Date(parsed.expiresAt) <= new Date()) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!auth) {
      // Logout — clear so the next user on this browser starts clean
      localStorage.removeItem(STORAGE_KEY);
      setActiveReservationState(null);
      return;
    }

    // Login — restore banner if the user still has a live PENDING reservation
    getMyReservations()
      .then((reservations) => {
        const pending = reservations.find(
          (r) => r.status === 'PENDING' && new Date(r.expiresAt) > new Date()
        );
        if (pending) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
          setActiveReservationState(pending);
        } else {
          localStorage.removeItem(STORAGE_KEY);
          setActiveReservationState(null);
        }
      })
      .catch(() => {
        // Non-critical — banner simply won't show if the fetch fails
      });
  }, [auth]);

  const setActiveReservation = (reservation) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservation));
    setActiveReservationState(reservation);
  };

  const clearActiveReservation = () => {
    localStorage.removeItem(STORAGE_KEY);
    setActiveReservationState(null);
  };

  return (
    <ReservationContext.Provider value={{ activeReservation, setActiveReservation, clearActiveReservation }}>
      {children}
    </ReservationContext.Provider>
  );
}

export function useReservation() {
  return useContext(ReservationContext);
}
