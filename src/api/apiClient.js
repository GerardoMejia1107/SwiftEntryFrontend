import axios from 'axios';

const apiClient = axios.create({ baseURL: '/swift_entry' });

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new Event('session-expired'));
    }
    return Promise.reject(error);
  }
);

export default apiClient;
