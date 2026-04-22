import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { productService } from '../services/productService';
import { messageService } from '../services/messageService';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { formatPrice, formatRelative, getConditionLabel, getConditionColor } from '../utils/formatters';
import RatingStars from '../components/common/RatingStars';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FiMapPin, FiPhone, FiMessageCircle, FiShoppingCart, FiHeart, FiShare2, FiCheckCircle, FiClock, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [activeImage, setActiveImage] = useState(0);

  const { data: product, isLoading } = useQuery(['product', id], () => productService.getProduct(id));

  const handleContact = async () => {
    if (!isAuthenticated) { toast.error('Please login to contact seller'); navigate('/login'); return; }
    try {
      const conv = await messageService.createConversation({ otherUserId: product.seller._id, productId: product._id });
      navigate(`/messages?conv=${conv._id}`);
    } catch { toast.error('Could not start conversation'); }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) { toast.error('Please login to buy'); navigate('/login'); return; }
    addToCart(product);
    navigate('/checkout');
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (!product) return <div className="container-custom py-20 text-center"><h2 className="text-2xl font-bold">Product not found</h2></div>;

  const images = product.images?.length ? product.images : [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600' }];

  return (
    <>
      <Helmet><title>{product.title} | ተና SecondLoop</title></Helmet>
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Images */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl overflow-hidden shadow-md mb-4">
              <motion.img key={activeImage} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                src={images[activeImage]?.url} alt={product.title}
                className="w-full h-72 md:h-96 object-cover"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'; }} />
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition ${i === activeImage ? 'border-primary-orange' : 'border-transparent'}`}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Details */}
            <div className="bg-white rounded-2xl shadow-md p-6 mt-6">
              <h2 className="text-xl font-bold mb-4">Product Details</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {[
                  ['Category', product.category],
                  ['Subcategory', product.subcategory || '-'],
                  ['Condition', getConditionLabel(product.condition)],
                  ['Negotiable', product.negotiable ? 'Yes' : 'No'],
                  ['Location', `${product.location?.subcity || ''} ${product.location?.city}`],
                  ['Listed', formatRelative(product.createdAt)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
                    <p className="font-medium text-gray-800 capitalize mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{product.description}</p>
              {product.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {product.tags.map(tag => (
                    <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Price Card */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-3xl font-bold text-primary-orange">{formatPrice(product.price)}</p>
                  {product.originalPrice && (
                    <p className="text-sm text-gray-400 line-through">{formatPrice(product.originalPrice)}</p>
                  )}
                </div>
                <span className={`badge ${getConditionColor(product.condition)}`}>{getConditionLabel(product.condition)}</span>
              </div>
              <h1 className="text-lg font-bold text-gray-800 mb-4">{product.title}</h1>

              <div className="flex items-center gap-3 text-sm text-gray-500 mb-5">
                <span className="flex items-center gap-1"><FiEye size={14} />{product.viewCount} views</span>
                <span className="flex items-center gap-1"><FiMapPin size={14} />{product.location?.city}</span>
              </div>

              {product.seller?._id !== user?._id && (
                <div className="space-y-3">
                  <button onClick={handleBuyNow} className="btn-primary w-full flex items-center justify-center gap-2">
                    <FiShoppingCart size={18} /> Buy Now
                  </button>
                  <button onClick={handleContact} className="btn-outline w-full flex items-center justify-center gap-2">
                    <FiMessageCircle size={18} /> Contact Seller
                  </button>
                </div>
              )}

              <div className="mt-4 p-3 bg-green-50 rounded-xl text-xs text-green-700">
                🔒 <strong>Escrow Protected</strong> – Your payment is held until you confirm receipt
              </div>
            </div>

            {/* Seller Card */}
            {product.seller && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="font-bold mb-4">Seller Information</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary-orange text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {product.seller.name?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold">{product.seller.name}</p>
                    <div className="flex items-center gap-1">
                      <RatingStars rating={product.seller.rating || 0} size={14} />
                      <span className="text-xs text-gray-500">({product.seller.totalReviews || 0})</span>
                    </div>
                    {product.seller.isIdentityVerified && (
                      <span className="text-xs text-green-600 flex items-center gap-1 mt-0.5"><FiCheckCircle size={11} /> Verified</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <FiClock size={14} />
                  <span>Member since {formatRelative(product.seller.createdAt || Date.now())}</span>
                </div>
                <Link to={`/users/${product.seller._id}`} className="btn-outline w-full text-center block text-sm py-2">
                  View Profile
                </Link>
              </div>
            )}

            {/* Safety Tips */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <h4 className="font-semibold text-amber-800 mb-3">🛡️ Safety Tips</h4>
              <ul className="text-xs text-amber-700 space-y-1.5">
                <li>• Always use TENA's escrow payment system</li>
                <li>• Meet in public places for pickup</li>
                <li>• Inspect the item before confirming delivery</li>
                <li>• Never pay outside the platform</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default ProductDetailPage;
