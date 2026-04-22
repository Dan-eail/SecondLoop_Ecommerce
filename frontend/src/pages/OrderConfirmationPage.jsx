import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import { orderService } from '../services/orderService';
import { formatPrice } from '../utils/formatters';
import { FiCheckCircle, FiPackage } from 'react-icons/fi';

const OrderConfirmationPage = () => {
  const { id } = useParams();
  const { data: order } = useQuery(['order-conf', id], () => orderService.getOrder(id));

  return (
    <>
      <Helmet><title>Order Confirmed | ተና SecondLoop</title></Helmet>
      <div className="max-w-lg mx-auto text-center py-16 px-4">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiCheckCircle size={48} className="text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Placed!</h1>
        <p className="text-gray-500 mb-6">Your order has been confirmed and is awaiting payment verification.</p>
        {order && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-8 text-left">
            <p className="font-mono text-sm text-gray-400 mb-2">{order.orderNumber}</p>
            <h3 className="font-bold mb-4">{order.product?.title}</h3>
            <div className="bg-orange-50 p-4 rounded-xl">
              <p className="font-semibold text-orange-800 mb-2">Next Steps:</p>
              <ol className="text-sm text-orange-700 space-y-1.5 list-decimal list-inside">
                <li>Send <strong>{formatPrice(order.totalAmount)}</strong> to Telebirr: <strong>+251 911 111 111</strong></li>
                <li>Upload payment screenshot in your order page</li>
                <li>Admin verifies payment (within 2 hours)</li>
                <li>Seller ships your item</li>
                <li>Confirm delivery to release payment</li>
              </ol>
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={`/orders/${id}`} className="btn-primary flex items-center justify-center gap-2 py-3">
            <FiPackage size={18} /> View Order & Pay
          </Link>
          <Link to="/products" className="btn-outline py-3">Continue Shopping</Link>
        </div>
      </div>
    </>
  );
};
export default OrderConfirmationPage;
