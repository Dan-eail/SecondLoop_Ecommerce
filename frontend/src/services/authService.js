import api from './api';
export const authService = {
  register: async (data) => { const res = await api.post('/auth/register', data); return res.data.data; },
  verifyOTP: async (phone, otp) => { const res = await api.post('/auth/verify-otp', { phone, otp }); return res.data.data; },
  login: async (phone, password, rememberMe) => { const res = await api.post('/auth/login', { phone, password, rememberMe }); return res.data.data; },
  logout: async () => { const res = await api.post('/auth/logout'); return res.data; },
  forgotPassword: async (phone) => { const res = await api.post('/auth/forgot-password', { phone }); return res.data; },
  resetPassword: async (phone, otp, newPassword) => { const res = await api.post('/auth/reset-password', { phone, otp, newPassword }); return res.data; },
  getProfile: async () => { const res = await api.get('/auth/me'); return res.data.data; },
  updateProfile: async (data) => { const res = await api.put('/auth/profile', data); return res.data.data; },
};
