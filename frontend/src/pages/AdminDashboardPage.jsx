import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../services/api';
import { formatPrice, formatDate, getStatusColor, getStatusLabel } from '../utils/formatters';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FiUsers, FiPackage, FiShoppingBag, FiBarChart2, FiCheck, FiX, FiDollarSign } from 'react-icons/fi';
import toast from 'react-hot-toast';

// Analytics
const AnalyticsPage = () => {
  const { data, isLoading } = useQuery('admin-analytics', async () => {
    const r = await api.get('/admin/analytics');
    return r.data.data;
  });
  if (isLoading) return <LoadingSpinner className="py-20" />;
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">📊 Analytics Overview</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Users', value: data?.users?.total, icon: '👥', color: 'bg-blue-500' },
          { label: 'Total Products', value: data?.products?.total, icon: '📦', color: 'bg-green-500' },
          { label: 'Total Orders', value: data?.orders?.total, icon: '🛒', color: 'bg-purple-500' },
          { label: 'Platform Revenue', value: formatPrice(data?.revenue?.total || 0), icon: '💰', color: 'bg-orange-500' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className={`${color} text-white rounded-2xl p-6`}>
            <div className="text-3xl mb-2">{icon}</div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-sm opacity-80">{label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'User Stats', items: [['Total', data?.users?.total], ['New (month)', data?.users?.new], ['Active Sellers', data?.users?.activeSellers]] },
          { title: 'Order Stats', items: [['Total Orders', data?.orders?.total], ['Completed', data?.orders?.completed], ['Disputed', data?.orders?.disputed]] },
          { title: 'Product Stats', items: [['Total Listed', data?.products?.total], ['Active', data?.products?.active], ['Sold', data?.products?.sold]] },
        ].map(({ title, items }) => (
          <div key={title} className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="font-bold mb-4">{title}</h3>
            <div className="space-y-2">
              {items.map(([label, value]) => (
                <div key={label} className="flex justify-between py-2 border-b last:border-0">
                  <span className="text-gray-500 text-sm">{label}</span>
                  <span className="font-bold">{value ?? '-'}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Users Management
const UsersPage = () => {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery('admin-users', async () => { const r = await api.get('/admin/users'); return r.data.data; });

  const updateUser = useMutation(({ id, status }) => api.put(`/admin/users/${id}`, { status }), {
    onSuccess: () => { toast.success('User updated'); qc.invalidateQueries('admin-users'); },
  });

  if (isLoading) return <LoadingSpinner className="py-20" />;
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">👥 User Management</h1>
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>{['Name', 'Phone', 'Role', 'Status', 'Joined', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y">
            {data?.users?.map(u => (
              <tr key={u._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-gray-500">{u.phone}</td>
                <td className="px-4 py-3 capitalize"><span className="badge badge-info">{u.role}</span></td>
                <td className="px-4 py-3"><span className={`badge ${u.status === 'active' ? 'badge-success' : 'badge-error'}`}>{u.status}</span></td>
                <td className="px-4 py-3 text-gray-400">{formatDate(u.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {u.status !== 'suspended' && <button onClick={() => updateUser.mutate({ id: u._id, status: 'suspended' })} className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200">Suspend</button>}
                    {u.status !== 'banned' && <button onClick={() => updateUser.mutate({ id: u._id, status: 'banned' })} className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">Ban</button>}
                    {u.status !== 'active' && <button onClick={() => updateUser.mutate({ id: u._id, status: 'active' })} className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200">Activate</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Products Moderation
const ProductsModerationPage = () => {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery('admin-products', async () => { const r = await api.get('/admin/products'); return r.data.data; });
  const moderate = useMutation(({ id, status }) => api.put(`/admin/products/${id}`, { status }), {
    onSuccess: () => { toast.success('Product updated'); qc.invalidateQueries('admin-products'); },
  });

  if (isLoading) return <LoadingSpinner className="py-20" />;
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">📦 Product Moderation</h1>
      <div className="space-y-4">
        {data?.products?.map(p => (
          <div key={p._id} className="bg-white rounded-2xl shadow-md p-5 flex gap-4 items-center">
            <img src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80'} alt="" className="w-16 h-16 object-cover rounded-xl flex-shrink-0"
              onError={e => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80'; }} />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold line-clamp-1">{p.title}</h3>
              <p className="text-sm text-gray-500">By: {p.seller?.name} | {formatPrice(p.price)}</p>
              <span className={`badge text-xs ${p.status === 'active' ? 'badge-success' : p.status === 'flagged' ? 'badge-warning' : 'badge-error'}`}>{p.status}</span>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => moderate.mutate({ id: p._id, status: 'active' })} title="Approve"
                className="p-2 text-green-500 hover:bg-green-50 rounded-lg"><FiCheck size={18} /></button>
              <button onClick={() => moderate.mutate({ id: p._id, status: 'flagged' })} title="Flag"
                className="p-2 text-yellow-500 hover:bg-yellow-50 rounded-lg"><FiPackage size={18} /></button>
              <button onClick={() => moderate.mutate({ id: p._id, status: 'banned' })} title="Ban"
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><FiX size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Orders Management
const OrdersPage = () => {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery('admin-orders', async () => { const r = await api.get('/orders', { params: { role: 'admin', limit: 50 } }); return r.data.data; });
  const releaseEscrow = useMutation(id => api.post(`/admin/orders/${id}/release-payment`), {
    onSuccess: () => { toast.success('Payment released!'); qc.invalidateQueries('admin-orders'); },
  });

  if (isLoading) return <LoadingSpinner className="py-20" />;
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">🛒 Orders Management</h1>
      <div className="space-y-3">
        {data?.orders?.map(o => (
          <div key={o._id} className="bg-white rounded-2xl shadow-md p-5 flex gap-4 items-center">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-gray-400">{o.orderNumber}</span>
                <span className={`badge ${getStatusColor(o.status)} text-xs`}>{getStatusLabel(o.status)}</span>
              </div>
              <p className="font-semibold text-sm line-clamp-1">{o.product?.title}</p>
              <p className="text-sm text-gray-500">Buyer: {o.buyer?.name} | Amount: {formatPrice(o.totalAmount)}</p>
            </div>
            {o.escrowStatus === 'held' && (
              <button onClick={() => releaseEscrow.mutate(o._id)}
                className="flex items-center gap-1 bg-green-500 text-white text-xs px-3 py-2 rounded-lg hover:bg-green-600 transition flex-shrink-0">
                <FiDollarSign size={14} /> Release Payment
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminDashboardPage = () => (
  <>
    <Helmet><title>Admin Dashboard | ተና SecondLoop</title></Helmet>
    <Routes>
      <Route index element={<AnalyticsPage />} />
      <Route path="users" element={<UsersPage />} />
      <Route path="products" element={<ProductsModerationPage />} />
      <Route path="orders" element={<OrdersPage />} />
    </Routes>
  </>
);
export default AdminDashboardPage;
