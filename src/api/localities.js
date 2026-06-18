import client from './client';

export const createLocality = async (payload) => {
  const response = await client.post('/localities', payload);
  return response.data.data;
};

export const getLocalitiesByEvent = async (eventId) => {
  const response = await client.get(`/localities/event/${eventId}`);
  return response.data.data;
};
