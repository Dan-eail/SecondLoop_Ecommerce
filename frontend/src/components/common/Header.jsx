import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import {
  FiSearch, FiShoppingCart, FiUser, FiMenu, FiX,
  FiHeart, FiMessageCircle, FiLogOut, FiSettings,
  FiPackage, FiList, FiShield
} from 'react-icons/fi';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg py-3' : 'bg-white/95 backdrop-blur-md shadow-md py-4'}`}>
      <div className="container-custom">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <span className="text-2xl font-bold text-primary-orange font-amharic">ተና</span>
            <span className="text-lg font-semibold text-primary-brown hidden sm:inline">SecondLoop</span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search phones, furniture, cars…"
                className="w-full px-5 py-2.5 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent text-sm"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-orange">
                <FiSearch size={18} />
              </button>
            </div>
          </form>

          {/* Nav Icons */}
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <Link to="/create-listing" className="hidden sm:inline-flex items-center gap-1 bg-primary-green text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-green-700 transition">
                + Sell
              </Link>
            )}
            <Link to="/wishlist" className="text-gray-600 hover:text-primary-orange transition hidden sm:block"><FiHeart size={22} /></Link>
            <Link to="/messages" className="text-gray-600 hover:text-primary-orange transition hidden sm:block"><FiMessageCircle size={22} /></Link>
            <Link to="/checkout" className="relative text-gray-600 hover:text-primary-orange transition">
              <FiShoppingCart size={22} />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-orange text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-primary-orange" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-primary-orange text-white flex items-center justify-center font-bold text-sm">
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                </button>
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl z-50 border border-gray-100 overflow-hidden"
                      onMouseLeave={() => setIsUserMenuOpen(false)}
                    >
                      <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-orange-100 border-b">
                        <p className="font-semibold text-sm truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.phone}</p>
                      </div>
                      <nav className="py-1">
                        {[
                          { to: '/profile', icon: FiUser, label: 'My Profile' },
                          { to: '/my-listings', icon: FiList, label: 'My Listings' },
                          { to: '/my-orders', icon: FiPackage, label: 'My Orders' },
                          { to: '/seller-dashboard', icon: FiSettings, label: 'Seller Dashboard' },
                          ...(isAdmin ? [{ to: '/admin', icon: FiShield, label: 'Admin Panel' }] : []),
                        ].map(({ to, icon: Icon, label }) => (
                          <Link key={to} to={to} onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-primary-orange transition-colors">
                            <Icon size={16} />{label}
                          </Link>
                        ))}
                        <button onClick={() => { logout(); setIsUserMenuOpen(false); }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t mt-1">
                          <FiLogOut size={16} /> Logout
                        </button>
                      </nav>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="bg-primary-orange text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-orange-700 transition">
                Login
              </Link>
            )}

            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-gray-600 p-1">
              {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mt-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products…"
                className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-orange" />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2"><FiSearch className="text-gray-400" size={16} /></button>
            </div>
          </form>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-3 pb-3 border-t pt-3 space-y-1">
              {[
                { to: '/products', label: 'Browse Products' },
                { to: '/wishlist', label: '❤️ Wishlist' },
                { to: '/messages', label: '💬 Messages' },
                ...(isAuthenticated ? [{ to: '/create-listing', label: '+ Sell Item' }, { to: '/my-orders', label: 'My Orders' }] : [
                  { to: '/login', label: 'Login' },
                  { to: '/register', label: 'Register' },
                ]),
              ].map(({ to, label }) => (
                <Link key={to} to={to} onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-orange hover:bg-orange-50 rounded-lg transition">
                  {label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
export default Header;
