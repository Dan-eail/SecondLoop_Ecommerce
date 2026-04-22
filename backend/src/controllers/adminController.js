const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { Notification, Transaction } = require('../models/index');
const { apiError } = require('../utils/apiError');
const { asyncHandler } = require('../utils/asyncHandler');

const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, status, search } = req.query;
  const query = {};
  if (role) query.role = role;
  if (status) query.status = status;
  if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { phone: { $regex: search, $options: 'i' } }];
  const users = await User.find(query).select('-password -refreshToken').sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit);
  const total = await User.countDocuments(query);
  res.json({ success: true, data: { users, pagination: { currentPage: Number(page), totalPages: Math.ceil(total / limit), totalItems: total } }, timestamp: new Date().toISOString() });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const { status, role } = req.body;
  const user = await User.findById(req.params.userId);
  if (!user) throw apiError(404, 'User not found');
  if (status) user.status = status;
  if (role) user.role = role;
  await user.save();
  res.json({ success: true, message: 'User updated successfully', timestamp: new Date().toISOString() });
});

const getProductsForModeration = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status) query.status = status;
  const products = await Product.find(query).populate('seller', 'name phone').sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit);
  const total = await Product.countDocuments(query);
  res.json({ success: true, data: { products, pagination: { currentPage: Number(page), totalPages: Math.ceil(total / limit), totalItems: total } }, timestamp: new Date().toISOString() });
});

const moderateProduct = asyncHandler(async (req, res) => {
  const { status, moderationNote } = req.body;
  const product = await Product.findById(req.params.productId);
  if (!product) throw apiError(404, 'Product not found');
  product.status = status;
  await product.save();
  await Notification.create({ user: product.seller, type: 'system', title: 'Product Status Updated', body: `Your product "${product.title}" has been ${status}. ${moderationNote || ''}` });
  res.json({ success: true, message: `Product ${status} successfully`, timestamp: new Date().toISOString() });
});

const releaseEscrowPayment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) throw apiError(404, 'Order not found');
  if (order.escrowStatus !== 'held') throw apiError(400, 'Escrow not in held status');
  order.escrowStatus = 'released';
  order.status = 'completed';
  order.completedAt = new Date();
  order.statusHistory.push({ status: 'completed', note: 'Escrow released by admin' });
  await order.save();
  await Transaction.create({ order: order._id, type: 'escrow_release', amount: order.sellerPayout, status: 'completed', completedAt: new Date() });
  await User.findByIdAndUpdate(order.seller, { $inc: { totalSales: 1 } });
  await User.findByIdAndUpdate(order.buyer, { $inc: { totalPurchases: 1 } });
  await Notification.create({ user: order.seller, type: 'payment', title: 'Payment Released', body: `Payment of ${order.sellerPayout} ETB for order ${order.orderNumber} has been released.` });
  res.json({ success: true, message: 'Escrow payment released successfully', timestamp: new Date().toISOString() });
});

const resolveDispute = asyncHandler(async (req, res) => {
  const { resolution, winner } = req.body;
  const order = await Order.findById(req.params.orderId);
  if (!order) throw apiError(404, 'Order not found');
  if (order.status !== 'disputed') throw apiError(400, 'Order is not in dispute');
  order.dispute.resolvedBy = req.user._id;
  order.dispute.resolution = resolution;
  order.dispute.resolvedAt = new Date();
  if (winner === 'buyer') {
    order.escrowStatus = 'refunded';
    order.status = 'refunded';
    order.statusHistory.push({ status: 'refunded', note: `Dispute resolved in buyer's favor: ${resolution}` });
    await Notification.create({ user: order.buyer, type: 'payment', title: 'Dispute Resolved', body: `Dispute resolved in your favor. Refund will be processed.` });
  } else {
    order.escrowStatus = 'released';
    order.status = 'completed';
    order.completedAt = new Date();
    order.statusHistory.push({ status: 'completed', note: `Dispute resolved in seller's favor: ${resolution}` });
    await Notification.create({ user: order.seller, type: 'payment', title: 'Dispute Resolved', body: `Dispute resolved in your favor. Payment will be released.` });
  }
  await order.save();
  res.json({ success: true, message: 'Dispute resolved successfully', timestamp: new Date().toISOString() });
});

const getAnalytics = asyncHandler(async (req, res) => {
  const { period = 'month' } = req.query;
  let startDate;
  const now = new Date();
  if (period === 'week') startDate = new Date(now.setDate(now.getDate() - 7));
  else if (period === 'year') startDate = new Date(now.setFullYear(now.getFullYear() - 1));
  else startDate = new Date(now.setMonth(now.getMonth() - 1));

  const [userStats, orderStats, revenueStats, productStats] = await Promise.all([
    User.aggregate([{ $facet: { totalUsers: [{ $count: 'count' }], newUsers: [{ $match: { createdAt: { $gte: startDate } } }, { $count: 'count' }], activeSellers: [{ $match: { role: 'seller' } }, { $count: 'count' }] } }]),
    Order.aggregate([{ $facet: { totalOrders: [{ $count: 'count' }], completedOrders: [{ $match: { status: 'completed' } }, { $count: 'count' }], disputedOrders: [{ $match: { status: 'disputed' } }, { $count: 'count' }], averageOrderValue: [{ $match: { status: 'completed' } }, { $group: { _id: null, avg: { $avg: '$totalAmount' } } }] } }]),
    Order.aggregate([{ $match: { status: 'completed', escrowStatus: 'released' } }, { $group: { _id: null, totalRevenue: { $sum: '$platformFee' }, totalGMV: { $sum: '$totalAmount' } } }]),
    Product.aggregate([{ $facet: { totalListings: [{ $count: 'count' }], activeListings: [{ $match: { status: 'active' } }, { $count: 'count' }], soldListings: [{ $match: { status: 'sold' } }, { $count: 'count' }] } }]),
  ]);

  res.json({
    success: true,
    data: {
      period,
      users: { total: userStats[0]?.totalUsers[0]?.count || 0, new: userStats[0]?.newUsers[0]?.count || 0, activeSellers: userStats[0]?.activeSellers[0]?.count || 0 },
      orders: { total: orderStats[0]?.totalOrders[0]?.count || 0, completed: orderStats[0]?.completedOrders[0]?.count || 0, disputed: orderStats[0]?.disputedOrders[0]?.count || 0, averageValue: orderStats[0]?.averageOrderValue[0]?.avg || 0 },
      revenue: { total: revenueStats[0]?.totalRevenue || 0, gmv: revenueStats[0]?.totalGMV || 0 },
      products: { total: productStats[0]?.totalListings[0]?.count || 0, active: productStats[0]?.activeListings[0]?.count || 0, sold: productStats[0]?.soldListings[0]?.count || 0 },
    },
    timestamp: new Date().toISOString(),
  });
});

module.exports = { getAllUsers, updateUserStatus, getProductsForModeration, moderateProduct, releaseEscrowPayment, resolveDispute, getAnalytics };
