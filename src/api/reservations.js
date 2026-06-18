import client from './client';

export const getAllReservations = async () => {
  const response = await client.get('/reservations');
  return response.data.data;
};

export const getMyReservations = async () => {
  const response = await client.get('/reservations/me');
  return response.data.data;
};

export const getOrganizerReservations = async () => {
  const response = await client.get('/reservations/organizer');
  return response.data.data;
};

export const createReservation = async (localitySeatIds) => {
  const response = await client.post('/reservations', { localitySeatIds });
  return response.data.data;
};
