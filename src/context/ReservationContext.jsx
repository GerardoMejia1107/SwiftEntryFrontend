import { createContext, useContext, useState } from 'react';

const ReservationContext = createContext(null);

const STORAGE_KEY = 'activeReservation';

export function ReservationProvider({ children }) {
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
