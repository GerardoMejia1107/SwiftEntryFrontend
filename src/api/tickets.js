import client from './client';

export const getMyTickets = async () => {
  const response = await client.get('/tickets/me');
  return response.data.data;
};
