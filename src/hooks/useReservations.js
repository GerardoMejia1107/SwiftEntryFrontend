import { useQuery } from './useQuery';
import * as reservationsApi from '../api/reservations';

export function useAllReservations() {
  const { data, loading, error, refetch } = useQuery(reservationsApi.getAllReservations);
  return { reservations: data ?? [], loading, error, refetch };
}

export function useMyReservations() {
  const { data, loading, error, refetch } = useQuery(reservationsApi.getMyReservations);
  return { reservations: data ?? [], loading, error, refetch };
}
