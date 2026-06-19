import client from './client';

export const processPayment = async ({ reservationId, paymentMethod, transactionReference }) => {
  const response = await client.post('/payments', {
    reservationId,
    paymentMethod,
    transactionReference,
  });
  return response.data.data;
};
