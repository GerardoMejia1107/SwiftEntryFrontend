import client from './client';

export const getMyTickets = async () => {
  const response = await client.get('/tickets/me');
  return response.data.data;
};

export const transferTicket = async ({ ticketId, receiverEmail }) => {
  const response = await client.post(`/tickets/${ticketId}/transfer`, { receiverEmail });
  return response.data.data;
};
