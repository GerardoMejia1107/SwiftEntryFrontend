import client from './client';

export const getEvents = async () => {
  const response = await client.get('/events');
  return response.data.data;
};

export const getEventsByOrganizer = async (id) => {
  const response = await client.get(`/events/organizer/${id}`);
  return response.data.data;
};

export const createEvent = async (payload) => {
  const response = await client.post('/events', payload);
  return response.data.data;
};

export const updateEvent = async (id, payload) => {
  const response = await client.put(`/events/${id}`, payload);
  return response.data.data;
};

export const deleteEvent = async (id) => {
  await client.delete(`/events/${id}`);
};
