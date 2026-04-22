const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { apiError } = require('../utils/apiError');
const { asyncHandler } = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) throw apiError(401, 'Not authorized, no token');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) throw apiError(401, 'User not found');
    if (req.user.status === 'banned') throw apiError(403, 'Account banned');
    next();
  } catch (err) {
    throw apiError(401, 'Not authorized, invalid token');
  }
});

const adminOnly = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    throw apiError(403, 'Admin access required');
  }
});

const sellerOnly = asyncHandler(async (req, res, next) => {
  if (req.user && (req.user.role === 'seller' || req.user.role === 'admin')) {
    next();
  } else {
    throw apiError(403, 'Seller access required');
  }
});

module.exports = { protect, adminOnly, sellerOnly };
