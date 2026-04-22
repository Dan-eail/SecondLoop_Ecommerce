import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FiUser, FiList, FiPackage, FiHeart, FiMessageCircle, FiSettings, FiTrendingUp, FiPlusCircle, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import Header from '../common/Header';

const navItems = [
  { to: '/profile', icon: FiUser, label: 'Profile' },
  { to: '/seller-dashboard', icon: FiTrendingUp, label: 'Dashboard' },
  { to: '/my-listings', icon: FiList, label: 'My Listings' },
  { to: '/create-listing', icon: FiPlusCircle, label: 'New Listing' },
  { to: '/my-orders', icon: FiPackage, label: 'Orders' },
  { to: '/wishlist', icon: FiHeart, label: 'Wishlist' },
  { to: '/messages', icon: FiMessageCircle, label: 'Messages' },
  { to: '/settings', icon: FiSettings, label: 'Settings' },
];

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 pt-20">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 pt-20 flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:shadow-md lg:z-auto`}>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex items-center gap-3 p-3 mb-4 bg-orange-50 rounded-xl">
              {user?.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary-orange text-white flex items-center justify-center font-bold">
                  {user?.name?.[0]}
                </div>
              )}
              <div className="overflow-hidden">
                <p className="font-semibold text-sm truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            <nav className="space-y-1">
              {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink key={to} to={to} onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-primary-orange text-white shadow-sm' : 'text-gray-600 hover:bg-orange-50 hover:text-primary-orange'}`
                  }>
                  <Icon size={18} /> {label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="p-4 border-t">
            <button onClick={() => { logout(); navigate('/'); }}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors">
              <FiLogOut size={18} /> Logout
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="lg:hidden sticky top-20 z-20 bg-white border-b px-4 py-3">
            <button onClick={() => setSidebarOpen(true)} className="flex items-center gap-2 text-gray-600 text-sm font-medium">
              <FiMenu size={20} /> Menu
            </button>
          </div>
          <main className="flex-1 p-4 md:p-6 lg:p-8 bg-secondary-light">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
export default DashboardLayout;
