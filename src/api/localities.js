import client from './client';

export const createLocality = async (payload) => {
  const response = await client.post('/localities', payload);
  return response.data.data;
};
