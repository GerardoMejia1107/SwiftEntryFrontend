import { useMutation } from './useMutation';
import * as paymentsApi from '../api/payments';

export function useProcessPayment() {
  const { mutate, loading, error, reset } = useMutation(paymentsApi.processPayment);
  return { processPayment: mutate, loading, error, reset };
}
