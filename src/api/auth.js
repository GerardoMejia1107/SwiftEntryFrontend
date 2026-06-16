import axios from 'axios';

// Separate instance — auth endpoints don't need the Bearer token interceptor.
const authClient = axios.create({ baseURL: '/swift_entry' });

export const login = async (credentials) => {
  const response = await authClient.post('/auth/login', credentials);
  return response.data.data;
};

export const registerUser = (payload) => authClient.post('/users', payload);
