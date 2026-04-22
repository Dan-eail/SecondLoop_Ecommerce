import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import { orderService } from '../services/orderService';
import { formatPrice, formatDate, getStatusLabel, getStatusColor } from '../utils/formatters';
import LoadingSpinner from '../components/common/LoadingSpinner';

const MyOrdersPage = () => {
  const [role, setRole] = useState('buyer');

  const { data, isLoading } = useQuery(['orders', role], () => orderService.getOrders({ role }));

  return (
    <>
      <Helmet><title>My Orders | ተና SecondLoop</title></Helmet>
      <div>
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>
        <div className="flex gap-2 mb-6">
          {['buyer', 'seller'].map(r => (
            <button key={r} onClick={() => setRole(r)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition ${role === r ? 'bg-primary-orange text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-orange hover:text-primary-orange'}`}>
              {r === 'buyer' ? '🛒 Purchases' : '📦 Sales'}
            </button>
          ))}
        </div>

        {isLoading ? <LoadingSpinner className="py-20" /> : (
          data?.orders?.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl">
              <div className="text-6xl mb-4">{role === 'buyer' ? '🛒' : '📦'}</div>
              <h3 className="text-xl font-semibold text-gray-600">No {role === 'buyer' ? 'purchases' : 'sales'} yet</h3>
              {role === 'buyer' && <Link to="/products" className="btn-primary inline-block mt-6">Browse Products</Link>}
            </div>
          ) : (
            <div className="space-y-4">
              {data?.orders?.map(order => (
                <Link key={order._id} to={`/orders/${order._id}`}
                  className="block bg-white rounded-2xl shadow-md p-5 hover:shadow-lg transition">
                  <div className="flex gap-4 items-center">
                    <img src={order.product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                      alt="" className="w-16 h-16 object-cover rounded-xl flex-shrink-0"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'; }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs text-gray-400">{order.orderNumber}</span>
                        <span className={`badge ${getStatusColor(order.status)}`}>{getStatusLabel(order.status)}</span>
                      </div>
                      <h3 className="font-semibold text-gray-800 line-clamp-1">{order.product?.title}</h3>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-primary-orange font-bold">{formatPrice(order.totalAmount)}</p>
                        <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
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
export default MyOrdersPage;
