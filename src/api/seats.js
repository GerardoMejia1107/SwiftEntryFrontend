import client from './client';

export const getSeatMap = async (eventId) => {
  const response = await client.get(`/seats/event/${eventId}`);
  return response.data.data;
};

export const assignSeats = async (payload) => {
  const response = await client.post('/seats/assign', payload);
  return response.data.data;
};

export const unassignSeat = async (localitySeatId) => {
  const response = await client.delete(`/seats/assignment/${localitySeatId}`);
  return response.data.data;
};
