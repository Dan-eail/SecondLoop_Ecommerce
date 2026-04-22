import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FiUsers, FiPackage, FiShoppingBag, FiBarChart2, FiShield, FiLogOut } from 'react-icons/fi';

const adminNav = [
  { to: '/admin', icon: FiBarChart2, label: 'Analytics', end: true },
  { to: '/admin/users', icon: FiUsers, label: 'Users' },
  { to: '/admin/products', icon: FiPackage, label: 'Products' },
  { to: '/admin/orders', icon: FiShoppingBag, label: 'Orders' },
];

const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-primary-brown text-white flex flex-col">
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center gap-2">
            <FiShield size={24} className="text-yellow-400" />
            <div>
              <div className="font-bold text-lg">TENA Admin</div>
              <div className="text-xs opacity-60">Control Panel</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {adminNav.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-white/20 text-white' : 'opacity-70 hover:opacity-100 hover:bg-white/10'}`
              }>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/20">
          <button onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm opacity-70 hover:opacity-100 hover:bg-white/10 transition">
            <FiLogOut size={18} /> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
};
export default AdminLayout;
