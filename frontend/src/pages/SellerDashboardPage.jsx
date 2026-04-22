import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuth } from '../hooks/useAuth';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { formatPrice } from '../utils/formatters';
import RatingStars from '../components/common/RatingStars';
import { FiPackage, FiDollarSign, FiEye, FiMessageCircle, FiTrendingUp, FiPlus } from 'react-icons/fi';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-2xl shadow-md p-6 flex items-center gap-4">
    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

const SellerDashboardPage = () => {
  const { user } = useAuth();

  const { data: listingsData } = useQuery('my-listings-dash', () => productService.getUserProducts(user._id));
  const { data: ordersData } = useQuery('my-sales-dash', () => orderService.getOrders({ role: 'seller' }));

  const listings = listingsData?.products || [];
  const orders = ordersData?.orders || [];
  const totalViews = listings.reduce((s, p) => s + (p.viewCount || 0), 0);
  const totalEarned = orders.filter(o => o.status === 'completed').reduce((s, o) => s + o.sellerPayout, 0);
  const activeListings = listings.filter(l => l.status === 'active').length;
  const pendingOrders = orders.filter(o => ['pending_payment', 'payment_verified', 'processing'].includes(o.status)).length;

  return (
    <>
      <Helmet><title>Seller Dashboard | ተና SecondLoop</title></Helmet>
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Seller Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, {user?.name?.split(' ')[0]}!</p>
          </div>
          <Link to="/create-listing" className="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
            <FiPlus size={16} /> New Listing
          </Link>
        </div>

        {/* Seller Profile Card */}
        <div className="bg-gradient-to-r from-primary-orange to-orange-600 text-white rounded-2xl p-6 mb-6 flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold flex-shrink-0">
            {user?.name?.[0]}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <RatingStars rating={user?.rating || 0} size={16} />
              <span className="text-sm opacity-90">({user?.totalReviews || 0} reviews)</span>
            </div>
            <p className="text-sm opacity-80 mt-1">{user?.location?.city} • Joined {new Date(user?.createdAt).getFullYear()}</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-3xl font-bold">{user?.totalSales || 0}</p>
            <p className="text-sm opacity-80">Total Sales</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={FiPackage} label="Active Listings" value={activeListings} color="bg-blue-500" />
          <StatCard icon={FiDollarSign} label="Total Earned" value={formatPrice(totalEarned)} color="bg-green-500" />
          <StatCard icon={FiEye} label="Total Views" value={totalViews.toLocaleString()} color="bg-purple-500" />
          <StatCard icon={FiTrendingUp} label="Pending Orders" value={pendingOrders} color="bg-orange-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Listings */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-lg">Recent Listings</h3>
              <Link to="/my-listings" className="text-sm text-primary-orange hover:underline">View All</Link>
            </div>
            {listings.slice(0, 5).length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No listings yet</p>
                <Link to="/create-listing" className="text-primary-orange hover:underline text-sm mt-2 inline-block">Create your first listing →</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {listings.slice(0, 5).map(p => (
                  <div key={p._id} className="flex items-center gap-3">
                    <img src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=60'} alt=""
                      className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=60'; }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1">{p.title}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-primary-orange text-sm font-bold">{formatPrice(p.price)}</p>
                        <span className={`badge text-xs ${p.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{p.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-lg">Recent Sales</h3>
              <Link to="/my-orders" className="text-sm text-primary-orange hover:underline">View All</Link>
            </div>
            {orders.slice(0, 5).length === 0 ? (
              <div className="text-center py-8 text-gray-400"><p>No sales yet</p></div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map(o => (
                  <Link key={o._id} to={`/orders/${o._id}`} className="flex items-center gap-3 hover:bg-gray-50 -mx-2 px-2 py-1.5 rounded-lg transition">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1">{o.product?.title}</p>
                      <p className="text-xs text-gray-400 font-mono">{o.orderNumber}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-sm text-primary-green">{formatPrice(o.sellerPayout)}</p>
                      <span className={`badge text-xs ${o.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>{o.status.replace(/_/g, ' ')}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
export default SellerDashboardPage;
