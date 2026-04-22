const User = require('../models/User');
const { Wishlist } = require('../models/index');
const { uploadToCloudinary } = require('../config/cloudinary');
const { apiError } = require('../utils/apiError');
const { asyncHandler } = require('../utils/asyncHandler');

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).select('-password -refreshToken -loginAttempts -lockUntil');
  if (!user) throw apiError(404, 'User not found');
  res.json({ success: true, data: user, timestamp: new Date().toISOString() });
});

const uploadProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) throw apiError(400, 'No file uploaded');
  const result = await uploadToCloudinary(req.file.buffer, 'profiles');
  const user = await User.findByIdAndUpdate(req.user._id, { profileImage: result.secure_url }, { new: true }).select('-password');
  res.json({ success: true, data: { profileImage: result.secure_url }, timestamp: new Date().toISOString() });
});

const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
  res.json({ success: true, data: wishlist?.products || [], timestamp: new Date().toISOString() });
});

const getNotifications = asyncHandler(async (req, res) => {
  const { Notification } = require('../models/index');
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, data: notifications, timestamp: new Date().toISOString() });
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const { Notification } = require('../models/index');
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true, readAt: new Date() });
  res.json({ success: true, message: 'Notification marked as read', timestamp: new Date().toISOString() });
});

module.exports = { getUserProfile, uploadProfileImage, getWishlist, getNotifications, markNotificationRead };
