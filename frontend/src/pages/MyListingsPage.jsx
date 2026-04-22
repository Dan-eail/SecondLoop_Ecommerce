import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { productService } from '../services/productService';
import { useAuth } from '../hooks/useAuth';
import { formatPrice, formatRelative, getConditionLabel } from '../utils/formatters';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FiEdit2, FiTrash2, FiEye, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';

const STATUS_COLORS = { active: 'badge-success', sold: 'badge-info', draft: 'badge-warning', archived: 'badge-error', flagged: 'badge-error', banned: 'badge-error' };

const MyListingsPage = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [filter, setFilter] = useState('all');

  const { data, isLoading } = useQuery(['my-listings', filter], () =>
    productService.getUserProducts(user._id, { status: filter === 'all' ? undefined : filter }));

  const deleteMutation = useMutation(productService.deleteProduct, {
    onSuccess: () => { toast.success('Listing deleted'); qc.invalidateQueries('my-listings'); },
    onError: () => toast.error('Failed to delete'),
  });

  const handleDelete = (id, title) => {
    if (window.confirm(`Delete "${title}"?`)) deleteMutation.mutate(id);
  };

  const tabs = ['all', 'active', 'sold', 'archived', 'draft'];

  return (
    <>
      <Helmet><title>My Listings | ተና SecondLoop</title></Helmet>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Listings</h1>
          <Link to="/create-listing" className="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
            <FiPlus size={16} /> New Listing
          </Link>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${filter === tab ? 'bg-primary-orange text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-orange hover:text-primary-orange'}`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {isLoading ? <LoadingSpinner className="py-20" /> : (
          data?.products?.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-600">No listings yet</h3>
              <p className="text-gray-400 mt-2 mb-6">Start selling by creating your first listing</p>
              <Link to="/create-listing" className="btn-primary inline-block">Create Listing</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {data?.products?.map(product => (
                <div key={product._id} className="bg-white rounded-2xl shadow-md p-5 flex gap-4 items-center">
                  <img src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                    alt={product.title} className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'; }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`badge ${STATUS_COLORS[product.status] || 'badge-info'} capitalize`}>{product.status}</span>
                      <span className="text-xs text-gray-400">{formatRelative(product.createdAt)}</span>
                    </div>
                    <h3 className="font-semibold text-gray-800 line-clamp-1">{product.title}</h3>
                    <p className="text-primary-orange font-bold">{formatPrice(product.price)}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                      <span>👁 {product.viewCount} views</span>
                      <span>💬 {product.inquiryCount} inquiries</span>
                      <span>❤️ {product.saveCount} saved</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Link to={`/products/${product._id}`} className="p-2 text-gray-400 hover:text-primary-orange hover:bg-orange-50 rounded-lg transition" title="View">
                      <FiEye size={18} />
                    </Link>
                    <Link to={`/edit-listing/${product._id}`} className="p-2 text-gray-400 hover:text-primary-green hover:bg-green-50 rounded-lg transition" title="Edit">
                      <FiEdit2 size={18} />
                    </Link>
                    <button onClick={() => handleDelete(product._id, product.title)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete">
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </>
  );
};
export default MyListingsPage;
