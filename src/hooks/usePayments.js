import { useQuery } from './useQuery';
import { useMutation } from './useMutation';
import * as paymentsApi from '../api/payments';
import * as ticketsApi from '../api/tickets';

export function useProcessPayment() {
  const { mutate, loading, error, reset } = useMutation(paymentsApi.processPayment);
  return { processPayment: mutate, loading, error, reset };
}

export function useMyPayments() {
  const { data, loading, error, refetch } = useQuery(paymentsApi.getMyPayments);
  return { payments: data ?? [], loading, error, refetch };
}

export function useMyTickets() {
  const { data, loading, error, refetch } = useQuery(ticketsApi.getMyTickets);
  return { tickets: data ?? [], loading, error, refetch };
}

export function useTransferTicket() {
  const { mutate, loading, error, reset } = useMutation(ticketsApi.transferTicket);
  return { transferTicket: mutate, loading, error, reset };
}
