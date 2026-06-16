import client from './client';

export const getUsers = async () => {
  const response = await client.get('/users');
  return response.data.data;
};
