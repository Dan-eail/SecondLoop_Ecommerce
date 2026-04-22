import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const normalizeUser = (u) => {
    if (!u) return u;
    // Some endpoints return `id` while others return Mongo `_id`.
    const _id = u._id || u.id;
    return _id ? { ...u, _id } : u;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const userData = await authService.getProfile();
      setUser(normalizeUser(userData));
    } catch { logout(); }
    finally { setLoading(false); }
  };

  const login = async (phone, password, rememberMe) => {
    try {
      const data = await authService.login(phone, password, rememberMe);
      localStorage.setItem('token', data.token);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setUser(normalizeUser(data.user));
      toast.success('Welcome back!');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Login failed');
      return { success: false };
    }
  };

  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      toast.success('OTP sent! Please verify your phone.');
      return { success: true, data };
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Registration failed');
      return { success: false };
    }
  };

  const verifyOTP = async (phone, otp) => {
    try {
      const data = await authService.verifyOTP(phone, otp);
      localStorage.setItem('token', data.token);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setUser(normalizeUser(data.user));
      toast.success('Phone verified! Welcome to TENA!');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Verification failed');
      return { success: false };
    }
  };

  const logout = async () => {
    try { await authService.logout(); } catch {}
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Logged out');
  };

  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await authService.updateProfile(profileData);
      setUser(updatedUser);
      toast.success('Profile updated!');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Update failed');
      return { success: false };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, isAdmin: user?.role === 'admin', isSeller: user?.role === 'seller' || user?.role === 'admin', login, register, verifyOTP, logout, updateProfile, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};
