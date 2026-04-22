import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import { productService } from '../services/productService';
import ProductGrid from '../components/product/ProductGrid';

const CATEGORIES = [
  { name: 'Electronics', icon: '📱', color: 'bg-blue-500' },
  { name: 'Furniture', icon: '🛋️', color: 'bg-amber-600' },
  { name: 'Clothing', icon: '👕', color: 'bg-purple-500' },
  { name: 'Books', icon: '📚', color: 'bg-yellow-500' },
  { name: 'Home Appliances', icon: '🔌', color: 'bg-red-500' },
  { name: 'Vehicles', icon: '🚗', color: 'bg-indigo-600' },
  { name: 'Sports & Outdoors', icon: '⚽', color: 'bg-green-500' },
  { name: 'Baby & Kids', icon: '🧸', color: 'bg-pink-500' },
];

const STATS = [
  { value: '50,000+', label: 'Active Listings' },
  { value: '30,000+', label: 'Happy Buyers' },
  { value: '15,000+', label: 'Verified Sellers' },
  { value: '100%', label: 'Escrow Protected' },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [searchQ, setSearchQ] = React.useState('');

  const { data: featuredData, isLoading: fl } = useQuery('featured', () => productService.getProducts({ isFeatured: true, limit: 8 }));
  const { data: recentData, isLoading: rl } = useQuery('recent', () => productService.getProducts({ sort: 'createdAt', order: 'desc', limit: 8 }));

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) navigate(`/products?q=${encodeURIComponent(searchQ.trim())}`);
  };

  return (
    <>
      <Helmet>
        <title>ተና SecondLoop – Ethiopia's Trusted Used Goods Marketplace</title>
        <meta name="description" content="Buy and sell used items safely in Ethiopia with escrow payment protection." />
      </Helmet>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-orange via-orange-500 to-orange-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-white" />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-white -translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="container-custom relative py-16 md:py-24">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 mb-4 text-sm font-medium">
              🇪🇹 Ethiopia's #1 C2C Marketplace
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Buy & Sell Used Goods <span className="text-yellow-300">Safely</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Protected by escrow payments. Verified sellers. Best prices in Ethiopia.
            </p>
            <form onSubmit={handleHeroSearch} className="flex gap-2 max-w-lg">
              <input type="text" value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Search for phones, cars, furniture…"
                className="flex-1 px-5 py-3 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-300 text-sm" />
              <button type="submit" className="bg-primary-brown text-white px-6 py-3 rounded-xl font-semibold hover:bg-yellow-900 transition whitespace-nowrap">
                Search
              </button>
            </form>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-secondary-light to-transparent" />
      </section>

      {/* Stats */}
      <section className="bg-white border-b">
        <div className="container-custom py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <div className="text-2xl md:text-3xl font-bold text-primary-orange">{value}</div>
                <div className="text-sm text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Shop by Category</h2>
            <Link to="/products" className="text-primary-orange text-sm font-medium hover:underline">View All →</Link>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-4">
            {CATEGORIES.map((cat, i) => (
              <motion.div key={cat.name} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/products?category=${encodeURIComponent(cat.name)}`} className="flex flex-col items-center group">
                  <div className={`${cat.color} w-14 h-14 md:w-16 md:h-16 mx-auto rounded-2xl flex items-center justify-center text-2xl md:text-3xl mb-2 group-hover:scale-110 transition-transform shadow-md`}>
                    {cat.icon}
                  </div>
                  <span className="text-xs font-medium text-gray-700 text-center leading-tight">{cat.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-secondary-light">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">⭐ Featured Listings</h2>
            <Link to="/products?isFeatured=true" className="text-primary-orange text-sm font-medium hover:underline">View All →</Link>
          </div>
          <ProductGrid products={featuredData?.products} loading={fl} />
        </div>
      </section>

      {/* Recent Products */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">🕒 Recently Added</h2>
            <Link to="/products" className="text-primary-orange text-sm font-medium hover:underline">Browse All →</Link>
          </div>
          <ProductGrid products={recentData?.products} loading={rl} />
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-primary-brown text-white">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Why Choose TENA?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: '🔒', title: 'Escrow Protection', desc: 'Your payment is held safely until you confirm receipt of your item.' },
              { icon: '✅', title: 'Verified Users', desc: 'Phone-verified accounts and seller rating system builds community trust.' },
              { icon: '📍', title: 'Local Marketplace', desc: 'Buy and sell within your city. Meet locally or get it delivered.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="p-6 bg-white/10 rounded-2xl">
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-sm opacity-80">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-primary-green to-green-700 text-white text-center">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Start Selling?</h2>
          <p className="opacity-90 mb-8 max-w-md mx-auto">List your used items in minutes and reach thousands of buyers across Ethiopia.</p>
          <Link to="/create-listing" className="inline-block bg-white text-primary-green font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition text-lg shadow-lg">
            + List Your Item Free
          </Link>
        </div>
      </section>
    </>
  );
};
export default HomePage;
