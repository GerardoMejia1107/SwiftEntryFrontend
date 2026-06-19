import client from './client';

export const processPayment = async ({ reservationId, paymentMethod }) => {
  const response = await client.post('/payments', { reservationId, paymentMethod });
  return response.data.data;
};

export const getMyPayments = async () => {
  const response = await client.get('/payments/me');
  return response.data.data;
};
