import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiEye, FiMessageCircle, FiMapPin } from 'react-icons/fi';
import { formatPrice, formatRelative, getConditionLabel, getConditionColor } from '../../utils/formatters';
import RatingStars from '../common/RatingStars';
import { productService } from '../../services/productService';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const ProductCard = ({ product, onWishlistToggle }) => {
  const { isAuthenticated } = useAuth();
  const imageUrl = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400';

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login to save items'); return; }
    try {
      await productService.toggleWishlist(product._id);
      toast.success('Wishlist updated');
      if (onWishlistToggle) onWishlistToggle(product._id);
    } catch { toast.error('Failed to update wishlist'); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card group">
      <Link to={`/products/${product._id}`}>
        <div className="relative overflow-hidden h-48">
          <img src={imageUrl} alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'; }} />
          <div className="absolute top-2 left-2">
            <span className={`badge ${getConditionColor(product.condition)} text-xs`}>{getConditionLabel(product.condition)}</span>
          </div>
          {product.isFeatured && (
            <div className="absolute top-2 right-10 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">Featured</div>
          )}
          <button onClick={handleWishlist}
            className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-red-50 hover:text-red-500 transition">
            <FiHeart size={15} />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-primary-orange font-medium bg-orange-50 px-2 py-0.5 rounded-full">{product.category}</span>
            {product.seller?.rating > 0 && <RatingStars rating={product.seller.rating} size={12} />}
          </div>
          <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1 text-sm">{product.title}</h3>
          <div className="flex items-center justify-between mb-2">
            <p className="text-primary-orange font-bold text-lg">{formatPrice(product.price)}</p>
            {product.negotiable && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Negotiable</span>}
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1"><FiMapPin size={11} />{product.location?.city}</span>
            <span className="flex items-center gap-2">
              <span className="flex items-center gap-0.5"><FiEye size={11} />{product.viewCount || 0}</span>
              <span className="flex items-center gap-0.5"><FiMessageCircle size={11} />{product.inquiryCount || 0}</span>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
export default ProductCard;
