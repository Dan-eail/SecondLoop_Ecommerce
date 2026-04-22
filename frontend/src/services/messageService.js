import api from './api';
export const messageService = {
  getConversations: async () => { const res = await api.get('/messages/conversations'); return res.data.data; },
  getMessages: async (id) => { const res = await api.get(`/messages/conversations/${id}`); return res.data.data; },
  createConversation: async (data) => { const res = await api.post('/messages/conversations', data); return res.data.data; },
  sendMessage: async (id, data) => { const res = await api.post(`/messages/conversations/${id}`, data); return res.data.data; },
};
