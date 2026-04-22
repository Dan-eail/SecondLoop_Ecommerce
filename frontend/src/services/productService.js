import api from './api';
export const productService = {
  getProducts: async (params) => { const res = await api.get('/products', { params }); return res.data.data; },
  getProduct: async (id) => { const res = await api.get(`/products/${id}`); return res.data.data; },
  createProduct: async (formData) => { const res = await api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }); return res.data.data; },
  updateProduct: async (id, formData) => { const res = await api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }); return res.data.data; },
  deleteProduct: async (id) => { const res = await api.delete(`/products/${id}`); return res.data; },
  getUserProducts: async (userId, params) => { const res = await api.get(`/users/${userId}/products`, { params }); return res.data.data; },
  toggleWishlist: async (id) => { const res = await api.post(`/products/${id}/wishlist`); return res.data; },
};
