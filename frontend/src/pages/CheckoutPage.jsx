import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../hooks/useCart';
import { orderService } from '../services/orderService';
import { formatPrice } from '../utils/formatters';
import { FiShoppingCart, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const { cartItems, clearCart, cartTotal } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [paymentMethod, setPaymentMethod] = useState('telebirr');

  const handleOrder = async () => {
    if (!cartItems.length) { toast.error('Cart is empty'); return; }
    setLoading(true);
    try {
      const item = cartItems[0];
      const result = await orderService.createOrder({ productId: item._id, deliveryMethod, paymentMethod });
      clearCart();
      toast.success('Order placed!');
      navigate(`/order-confirmation/${result.orderId}`);
    } catch (e) { toast.error(e.response?.data?.error?.message || 'Order failed'); }
    setLoading(false);
  };

  if (!cartItems.length) return (
    <div className="max-w-lg mx-auto text-center py-20">
      <FiShoppingCart size={60} className="mx-auto text-gray-200 mb-4" />
      <h2 className="text-2xl font-bold text-gray-600">Your cart is empty</h2>
      <button onClick={() => navigate('/products')} className="btn-primary mt-6">Browse Products</button>
    </div>
  );

  const fee = Math.min(Math.max(cartTotal * 0.05, 10), 500);

  return (
    <>
      <Helmet><title>Checkout | ተና SecondLoop</title></Helmet>
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-8 flex items-center gap-2"><FiShoppingCart size={24} className="text-primary-orange" /> Checkout</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Cart Items */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="font-bold mb-4">Items ({cartItems.length})</h2>
              {cartItems.map(item => (
                <div key={item._id} className="flex gap-4 items-center py-3 border-b last:border-0">
                  <img src={item.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80'} alt=""
                    className="w-16 h-16 object-cover rounded-xl"
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80'; }} />
                  <div className="flex-1">
                    <p className="font-semibold text-sm line-clamp-2">{item.title}</p>
                    <p className="text-primary-orange font-bold">{formatPrice(item.price)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="font-bold mb-4">Delivery Method</h2>
              {[{ value: 'pickup', label: '🤝 Pickup', desc: 'Meet seller in person' }, { value: 'delivery', label: '🚚 Delivery', desc: 'Delivered to your location (fee may apply)' }].map(({ value, label, desc }) => (
                <label key={value} className="flex items-center gap-3 p-3 rounded-xl border-2 mb-2 cursor-pointer transition hover:border-primary-orange" style={{ borderColor: deliveryMethod === value ? '#F57C00' : '#e5e7eb', background: deliveryMethod === value ? '#fff7ed' : 'white' }}>
                  <input type="radio" name="delivery" value={value} checked={deliveryMethod === value} onChange={() => setDeliveryMethod(value)} className="accent-primary-orange" />
                  <div>
                    <p className="font-medium">{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="font-bold mb-4">Payment Method</h2>
              {[{ value: 'telebirr', label: '📱 Telebirr', desc: 'Pay to TENA\'s Telebirr account' }, { value: 'bank_transfer', label: '🏦 Bank Transfer', desc: 'Pay via bank transfer' }].map(({ value, label, desc }) => (
                <label key={value} className="flex items-center gap-3 p-3 rounded-xl border-2 mb-2 cursor-pointer transition hover:border-primary-orange" style={{ borderColor: paymentMethod === value ? '#F57C00' : '#e5e7eb', background: paymentMethod === value ? '#fff7ed' : 'white' }}>
                  <input type="radio" name="payment" value={value} checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} className="accent-primary-orange" />
                  <div>
                    <p className="font-medium">{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-24">
              <h2 className="font-bold mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatPrice(cartTotal)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-gray-400">Platform Fee (5%)</span><span className="text-gray-400">{formatPrice(fee)}</span></div>
                <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
                  <span>Total</span><span className="text-primary-orange">{formatPrice(cartTotal)}</span>
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded-xl text-xs text-green-700 mb-4">
                🔒 Your payment is escrow-protected. Funds are only released to the seller after you confirm receipt.
              </div>
              <button onClick={handleOrder} disabled={loading} className="btn-primary w-full py-3.5 flex items-center justify-center gap-2">
                {loading ? <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><FiArrowRight size={18} /> Place Order</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default CheckoutPage;
