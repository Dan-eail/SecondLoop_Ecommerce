const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { Notification, Transaction } = require('../models/index');
const { uploadToCloudinary } = require('../config/cloudinary');
const { apiError } = require('../utils/apiError');
const { asyncHandler } = require('../utils/asyncHandler');
const { calculateFees } = require('../utils/helpers');

const createOrder = asyncHandler(async (req, res) => {
  const { productId, deliveryMethod, paymentMethod, deliveryAddress } = req.body;
  const product = await Product.findById(productId).populate('seller');
  if (!product) throw apiError(404, 'Product not found');
  if (product.status !== 'active') throw apiError(400, 'Product is not available');
  if (product.seller._id.toString() === req.user._id.toString()) throw apiError(400, 'Cannot buy your own product');
  const { platformFee, sellerPayout } = calculateFees(product.price);
  const deliveryFee = deliveryMethod === 'delivery' && product.deliveryOptions?.deliveryFee ? product.deliveryOptions.deliveryFee : 0;
  const totalAmount = product.price + deliveryFee;
  const order = await Order.create({
    buyer: req.user._id, seller: product.seller._id, product: productId,
    unitPrice: product.price, totalAmount, deliveryFee, deliveryMethod,
    paymentMethod, deliveryAddress: deliveryAddress || {},
    platformFee, sellerPayout,
    statusHistory: [{ status: 'pending_payment', note: 'Order created' }],
  });
  product.inquiryCount += 1;
  await product.save();
  await Notification.create({ user: product.seller._id, type: 'order', title: 'New Order!', body: `You have a new order for "${product.title}"`, actionUrl: `/seller/orders/${order._id}` });
  res.status(201).json({ success: true, data: { orderId: order._id, orderNumber: order.orderNumber, totalAmount, paymentMethod, message: 'Order created. Please complete payment.' }, timestamp: new Date().toISOString() });
});

const uploadPaymentProof = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) throw apiError(404, 'Order not found');
  if (order.buyer.toString() !== req.user._id.toString()) throw apiError(403, 'Not authorized');
  if (order.paymentStatus !== 'pending') throw apiError(400, 'Payment already processed');
  let imageUrl = '';
  if (req.file) { const result = await uploadToCloudinary(req.file.buffer, 'payment-proofs'); imageUrl = result.secure_url; }
  order.paymentProof = { imageUrl, uploadedAt: new Date() };
  order.paymentStatus = 'paid';
  order.status = 'payment_verified';
  order.escrowStatus = 'held';
  order.statusHistory.push({ status: 'payment_verified', note: 'Payment proof uploaded by buyer' });
  await order.save();
  await Notification.create({ user: order.seller, type: 'payment', title: 'Payment Received', body: `Payment for order ${order.orderNumber} verified. Please process the order.`, actionUrl: `/seller/orders/${order._id}` });
  res.json({ success: true, data: { status: order.status, message: 'Payment proof submitted. Admin will verify shortly.' }, timestamp: new Date().toISOString() });
});

const confirmDelivery = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) throw apiError(404, 'Order not found');
  if (order.buyer.toString() !== req.user._id.toString()) throw apiError(403, 'Not authorized');
  if (!['shipped', 'processing', 'payment_verified'].includes(order.status)) throw apiError(400, 'Cannot confirm delivery at this stage');
  order.status = 'delivered';
  order.deliveryTracking = { ...order.deliveryTracking, deliveredAt: new Date() };
  order.escrowReleasedAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
  order.statusHistory.push({ status: 'delivered', note: 'Buyer confirmed receipt' });
  await order.save();
  await Notification.create({ user: order.seller, type: 'order', title: 'Delivery Confirmed', body: `Buyer confirmed receipt of order ${order.orderNumber}. Funds will be released in 48 hours.` });
  res.json({ success: true, data: { status: order.status, message: 'Delivery confirmed. Funds will be released in 48 hours if no dispute.' }, timestamp: new Date().toISOString() });
});

const fileDispute = asyncHandler(async (req, res) => {
  const { reason, description } = req.body;
  const order = await Order.findById(req.params.orderId);
  if (!order) throw apiError(404, 'Order not found');
  if (order.buyer.toString() !== req.user._id.toString()) throw apiError(403, 'Not authorized');
  if (!['delivered', 'shipped'].includes(order.status)) throw apiError(400, 'Cannot file dispute at this stage');
  const evidence = [];
  if (req.files) { for (const file of req.files) { const result = await uploadToCloudinary(file.buffer, 'disputes'); evidence.push(result.secure_url); } }
  order.dispute = { filedBy: req.user._id, reason, description, evidence, filedAt: new Date() };
  order.status = 'disputed';
  order.escrowStatus = 'disputed';
  order.statusHistory.push({ status: 'disputed', note: `Dispute filed: ${reason}` });
  await order.save();
  await Notification.create({ user: order.seller, type: 'order', title: 'Dispute Filed', body: `A dispute has been filed for order ${order.orderNumber}. Reason: ${reason}` });
  res.json({ success: true, message: 'Dispute filed. Admin will review within 24 hours.', timestamp: new Date().toISOString() });
});

const getUserOrders = asyncHandler(async (req, res) => {
  const { role = 'buyer', status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (role === 'buyer') query.buyer = req.user._id;
  else query.seller = req.user._id;
  if (status) query.status = status;
  const orders = await Order.find(query).populate('product', 'title images price').populate('buyer', 'name phone').populate('seller', 'name phone').sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit);
  const total = await Order.countDocuments(query);
  res.json({ success: true, data: { orders, pagination: { currentPage: Number(page), totalPages: Math.ceil(total / limit), totalItems: total } }, timestamp: new Date().toISOString() });
});

const getOrderDetails = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId).populate('product', 'title description images condition').populate('buyer', 'name phone rating profileImage').populate('seller', 'name phone rating profileImage isIdentityVerified');
  if (!order) throw apiError(404, 'Order not found');
  if (order.buyer._id.toString() !== req.user._id.toString() && order.seller._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') throw apiError(403, 'Not authorized');
  res.json({ success: true, data: order, timestamp: new Date().toISOString() });
});

module.exports = { createOrder, uploadPaymentProof, confirmDelivery, fileDispute, getUserOrders, getOrderDetails };
