import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({ baseURL: API_URL, withCredentials: true });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        const res = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
        const newToken = res.data.data.token;
        localStorage.setItem('token', newToken);
        if (res.data.data.refreshToken) localStorage.setItem('refreshToken', res.data.data.refreshToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch { localStorage.removeItem('token'); localStorage.removeItem('refreshToken'); window.location.href = '/login'; }
    }
    return Promise.reject(error);
  }
);

export default api;
