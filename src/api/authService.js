import axios from 'axios';

const api = axios.create({ baseURL: '/swift_entry' });

export const registerUser = (payload) => api.post('/users', payload);

export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  // response.data is the full JSON body; response.data.data holds the tokens + role
  return response.data.data;
};
