import apiClient from './apiClient';

export const getAllEvents = async () => {
  const response = await apiClient.get('/events');
  return response.data.data;
};

export const createEvent = async (payload) => {
  const response = await apiClient.post('/events', payload);
  return response.data.data;
};

export const updateEvent = async (id, payload) => {
  const response = await apiClient.put(`/events/${id}`, payload);
  return response.data.data;
};

export const deleteEvent = async (id) => {
  await apiClient.delete(`/events/${id}`);
};

export const createLocality = async (payload) => {
  const response = await apiClient.post('/localities', payload);
  return response.data.data;
};
