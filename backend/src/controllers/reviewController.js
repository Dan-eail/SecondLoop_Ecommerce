const { Review } = require('../models/index');
const Order = require('../models/Order');
const User = require('../models/User');
const { apiError } = require('../utils/apiError');
const { asyncHandler } = require('../utils/asyncHandler');

const createReview = asyncHandler(async (req, res) => {
  const { orderId, rating, comment } = req.body;
  const order = await Order.findById(orderId);
  if (!order) throw apiError(404, 'Order not found');
  if (order.buyer.toString() !== req.user._id.toString()) throw apiError(403, 'Only buyer can review');
  if (order.status !== 'completed') throw apiError(400, 'Order not completed yet');
  const existing = await Review.findOne({ order: orderId, reviewer: req.user._id });
  if (existing) throw apiError(400, 'Already reviewed this order');
  const review = await Review.create({ order: orderId, reviewer: req.user._id, reviewee: order.seller, rating, comment });
  const reviews = await Review.find({ reviewee: order.seller });
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  await User.findByIdAndUpdate(order.seller, { rating: Math.round(avg * 10) / 10, totalReviews: reviews.length });
  res.status(201).json({ success: true, data: review, timestamp: new Date().toISOString() });
});

const getUserReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ reviewee: req.params.userId }).populate('reviewer', 'name profileImage').sort({ createdAt: -1 });
  res.json({ success: true, data: reviews, timestamp: new Date().toISOString() });
});

const respondToReview = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const review = await Review.findById(req.params.reviewId);
  if (!review) throw apiError(404, 'Review not found');
  if (review.reviewee.toString() !== req.user._id.toString()) throw apiError(403, 'Not authorized');
  review.response = { text, createdAt: new Date() };
  await review.save();
  res.json({ success: true, data: review, timestamp: new Date().toISOString() });
});

module.exports = { createReview, getUserReviews, respondToReview };
