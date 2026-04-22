import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { orderService } from '../services/orderService';
import { useAuth } from '../hooks/useAuth';
import { formatPrice, formatDate, getStatusLabel, getStatusColor } from '../utils/formatters';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FiUpload, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const OrderDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [paymentFile, setPaymentFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { data: order, isLoading } = useQuery(['order', id], () => orderService.getOrder(id));

  const confirmMutation = useMutation(() => orderService.confirmDelivery(id), {
    onSuccess: () => { toast.success('Delivery confirmed! Funds will be released in 48 hours.'); qc.invalidateQueries(['order', id]); },
    onError: () => toast.error('Failed to confirm delivery'),
  });

  const handlePaymentUpload = async () => {
    if (!paymentFile) { toast.error('Select payment proof image'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('paymentProof', paymentFile);
      await orderService.uploadPaymentProof(id, fd);
      toast.success('Payment proof submitted!');
      qc.invalidateQueries(['order', id]);
    } catch { toast.error('Upload failed'); }
    setUploading(false);
  };

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  if (!order) return <div className="text-center py-20"><h2 className="text-2xl font-bold">Order not found</h2></div>;

  const isBuyer = order.buyer?._id === user?._id;
  const isSeller = order.seller?._id === user?._id;

  return (
    <>
      <Helmet><title>Order {order.orderNumber} | ተና SecondLoop</title></Helmet>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Order Details</h1>
          <span className={`badge ${getStatusColor(order.status)} text-sm py-1 px-3`}>{getStatusLabel(order.status)}</span>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex gap-4 items-center mb-4">
            <img src={order.product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120'}
              alt="" className="w-20 h-20 object-cover rounded-xl"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120'; }} />
            <div>
              <p className="font-mono text-xs text-gray-400 mb-1">{order.orderNumber}</p>
              <h3 className="font-bold text-gray-800">{order.product?.title}</h3>
              <p className="text-2xl font-bold text-primary-orange mt-1">{formatPrice(order.totalAmount)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t text-sm">
            {[
              ['Payment Method', order.paymentMethod?.replace(/_/g, ' ')],
              ['Delivery Method', order.deliveryMethod],
              ['Platform Fee', formatPrice(order.platformFee)],
              ['Seller Payout', formatPrice(order.sellerPayout)],
              ['Order Date', formatDate(order.createdAt)],
              ['Escrow Status', order.escrowStatus],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-gray-400 text-xs uppercase tracking-wide">{label}</p>
                <p className="font-medium capitalize mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Buyer/Seller Info */}
        <div className="grid grid-cols-2 gap-4">
          {[['Buyer', order.buyer], ['Seller', order.seller]].map(([role, person]) => (
            person && (
              <div key={role} className="bg-white rounded-2xl shadow-md p-5">
                <p className="text-xs text-gray-400 uppercase mb-2">{role}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-orange text-white flex items-center justify-center font-bold">
                    {person.name?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{person.name}</p>
                    <p className="text-xs text-gray-500">{person.phone}</p>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>

        {/* Status History */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="font-bold mb-4">Order Timeline</h3>
          <div className="space-y-3">
            {order.statusHistory?.map((h, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary-orange rounded-full mt-1.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm capitalize">{h.status?.replace(/_/g, ' ')}</p>
                  {h.note && <p className="text-xs text-gray-500">{h.note}</p>}
                  <p className="text-xs text-gray-400">{formatDate(h.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        {isBuyer && order.status === 'pending_payment' && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="font-bold mb-4">💳 Upload Payment Proof</h3>
            <p className="text-sm text-gray-500 mb-4">
              Send <strong>{formatPrice(order.totalAmount)}</strong> to TENA's Telebirr: <strong>+251911111111</strong>, then upload screenshot below.
            </p>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 mb-4 text-center">
              {paymentFile ? (
                <div>
                  <img src={URL.createObjectURL(paymentFile)} alt="proof" className="h-32 mx-auto rounded-lg object-cover mb-2" />
                  <p className="text-sm text-gray-600">{paymentFile.name}</p>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-2 text-gray-400">
                  <FiUpload size={28} />
                  <span className="text-sm">Click to upload payment screenshot</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => setPaymentFile(e.target.files[0])} />
                </label>
              )}
            </div>
            <button onClick={handlePaymentUpload} disabled={uploading || !paymentFile} className="btn-primary w-full py-3">
              {uploading ? 'Uploading…' : 'Submit Payment Proof'}
            </button>
          </div>
        )}

        {isBuyer && ['shipped', 'delivered', 'processing', 'payment_verified'].includes(order.status) && order.status !== 'completed' && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="font-bold mb-2">Confirm Receipt</h3>
            <p className="text-sm text-gray-500 mb-4">Have you received the item? Confirming releases payment to the seller.</p>
            <button onClick={() => confirmMutation.mutate()} disabled={confirmMutation.isLoading} className="btn-secondary w-full py-3 flex items-center justify-center gap-2">
              <FiCheckCircle size={18} />
              {confirmMutation.isLoading ? 'Confirming…' : 'Confirm Delivery'}
            </button>
          </div>
        )}

        {order.status === 'completed' && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-2">✅</div>
            <h3 className="font-bold text-green-800">Order Completed!</h3>
            <p className="text-sm text-green-600 mt-1">Payment has been released to the seller.</p>
          </div>
        )}
      </div>
    </>
  );
};
export default OrderDetailPage;
