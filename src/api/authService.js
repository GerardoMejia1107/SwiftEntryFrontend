import axios from 'axios';

const api = axios.create({ baseURL: '/swift_entry' });

export const registerUser = (payload) => api.post('/users', payload);
export const loginUser = (credentials) => api.post('/auth/login', credentials);
