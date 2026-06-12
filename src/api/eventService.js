import axios from 'axios';

const api = axios.create({ baseURL: '/swift_entry' });

// GET /swift_entry/events -> lista de eventos (GeneralResponse.data)
export const getAllEvents = async () => {
  const response = await api.get('/events');
  return response.data.data;
};
