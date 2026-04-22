import api from './api';

export const adminService = {
  getUsers: async (params = {}) => { const { data } = await api.get('/admin/users', { params }); return data.data; },
  updateUser: async (userId, body) => { const { data } = await api.put(`/admin/users/${userId}`, body); return data; },
  getProducts: async (params = {}) => { const { data } = await api.get('/admin/products', { params }); return data.data; },
  moderateProduct: async (productId, body) => { const { data } = await api.put(`/admin/products/${productId}`, body); return data; },
  releasePayment: async (orderId) => { const { data } = await api.post(`/admin/orders/${orderId}/release-payment`); return data; },
  resolveDispute: async (orderId, body) => { const { data } = await api.put(`/admin/disputes/${orderId}/resolve`, body); return data; },
  getAnalytics: async (period = 'month') => { const { data } = await api.get('/admin/analytics', { params: { period } }); return data.data; },
};
