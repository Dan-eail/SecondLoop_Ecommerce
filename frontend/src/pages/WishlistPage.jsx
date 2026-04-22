import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../services/api';
import { formatPrice } from '../utils/formatters';
import { FiHeart, FiShoppingBag } from 'react-icons/fi';
import LoadingSpinner from '../components/common/LoadingSpinner';

const WishlistPage = () => {
  const { data: wishlist, isLoading } = useQuery('wishlist', async () => { const r = await api.get('/users/wishlist'); return r.data.data; });

  return (
    <>
      <Helmet><title>Wishlist | ተና SecondLoop</title></Helmet>
      <div>
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><FiHeart className="text-red-400" size={24} /> My Wishlist</h1>
        {isLoading ? <LoadingSpinner className="py-20" /> : (
          wishlist?.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl">
              <FiHeart size={60} className="mx-auto text-gray-200 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600">Your wishlist is empty</h3>
              <p className="text-gray-400 mt-2 mb-6">Save items you love by clicking the heart icon</p>
              <Link to="/products" className="btn-primary inline-flex items-center gap-2"><FiShoppingBag size={18} /> Browse Products</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlist?.map(product => (
                <Link key={product._id} to={`/products/${product._id}`} className="card group">
                  <div className="relative h-48 overflow-hidden">
                    <img src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'}
                      alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'; }} />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm line-clamp-2 mb-2">{product.title}</h3>
                    <p className="text-primary-orange font-bold">{formatPrice(product.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}
      </div>
    </>
  );
};
export default WishlistPage;
