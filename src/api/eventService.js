import axios from 'axios';

const api = axios.create({ baseURL: '/swift_entry' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// GET /swift_entry/events -> lista de eventos (GeneralResponse.data)
export const getAllEvents = async () => {
  const response = await api.get('/events');
  return response.data.data;
};

// POST /swift_entry/events -> crea un evento y devuelve el evento creado (con su id)
export const createEvent = async (payload) => {
  const response = await api.post('/events', payload);
  return response.data.data;
};

// POST /swift_entry/localities -> crea una localidad para un evento existente
export const createLocality = async (payload) => {
  const response = await api.post('/localities', payload);
  return response.data.data;
};
