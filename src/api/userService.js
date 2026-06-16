import axios from 'axios';

const api = axios.create({ baseURL: '/swift_entry' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getAllUsers = async () => {
  const response = await api.get('/users');
  return response.data.data;
};
