import client from './client';

export const getAllReservations = async () => {
  const response = await client.get('/reservations');
  return response.data.data;
};

export const getMyReservations = async () => {
  const response = await client.get('/reservations/me');
  return response.data.data;
};
