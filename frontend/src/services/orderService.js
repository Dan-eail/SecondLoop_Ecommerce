import api from './api';
export const orderService = {
  createOrder: async (data) => { const res = await api.post('/orders', data); return res.data.data; },
  getOrders: async (params) => { const res = await api.get('/orders', { params }); return res.data.data; },
  getOrder: async (id) => { const res = await api.get(`/orders/${id}`); return res.data.data; },
  uploadPaymentProof: async (id, formData) => { const res = await api.post(`/orders/${id}/payment-proof`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }); return res.data.data; },
  confirmDelivery: async (id) => { const res = await api.post(`/orders/${id}/confirm-delivery`); return res.data.data; },
  fileDispute: async (id, data) => { const res = await api.post(`/orders/${id}/dispute`, data); return res.data; },
};
