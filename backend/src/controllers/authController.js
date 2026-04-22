const User = require('../models/User');
const { OTPVerification } = require('../models/index');
const { generateToken, generateRefreshToken } = require('../utils/generateToken');
const { generateOTP } = require('../utils/generateOTP');
const { sendSMS } = require('../services/smsService');
const { apiError } = require('../utils/apiError');
const { asyncHandler } = require('../utils/asyncHandler');
const jwt = require('jsonwebtoken');
const isDev = process.env.NODE_ENV === 'development';

const register = asyncHandler(async (req, res) => {
  const { phone, name, password, city } = req.body;
  const userExists = await User.findOne({ phone });
  if (userExists) throw apiError(400, 'User already exists with this phone number');
  const user = await User.create({ phone, name, password, location: { city: city || 'Addis Ababa' } });
  const otp = generateOTP();
  await OTPVerification.create({ phone, otp, type: 'register', expiresAt: new Date(Date.now() + 10 * 60 * 1000) });
  await sendSMS(phone, `Your TENA verification code is: ${otp}. Valid for 10 minutes.`);
  const data = { userId: user._id, message: 'OTP sent to your phone', expiresIn: 600 };
  // In local development we don't have a real SMS gateway, so return OTP for testing.
  if (isDev) data.devOtp = otp;
  res.status(201).json({ success: true, data, timestamp: new Date().toISOString() });
});

const verifyOTP = asyncHandler(async (req, res) => {
  const { phone, otp } = req.body;
  const otpRecord = await OTPVerification.findOne({ phone, otp, isVerified: false, expiresAt: { $gt: new Date() } });
  if (!otpRecord) throw apiError(400, 'Invalid or expired OTP');
  otpRecord.isVerified = true;
  await otpRecord.save();
  const user = await User.findOne({ phone });
  if (!user) throw apiError(404, 'User not found');
  user.isPhoneVerified = true;
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  await user.save();
  res.json({ success: true, data: { token, refreshToken, user: { id: user._id, name: user.name, phone: user.phone, role: user.role } }, timestamp: new Date().toISOString() });
});

const login = asyncHandler(async (req, res) => {
  const { phone, password, rememberMe } = req.body;
  const user = await User.findOne({ phone });
  if (!user) throw apiError(401, 'Invalid credentials');
  if (user.isLocked()) throw apiError(401, 'Account temporarily locked. Try again later.');
  if (user.status === 'banned') throw apiError(403, 'Account has been banned');
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    user.loginAttempts = (user.loginAttempts || 0) + 1;
    if (user.loginAttempts >= 10) user.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();
    throw apiError(401, 'Invalid credentials');
  }
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  user.lastLogin = new Date();
  const tokenExpiry = rememberMe ? '30d' : '7d';
  const token = generateToken(user._id, tokenExpiry);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  await user.save();
  res.json({ success: true, data: { token, refreshToken, user: { id: user._id, name: user.name, phone: user.phone, role: user.role, rating: user.rating, profileImage: user.profileImage } }, timestamp: new Date().toISOString() });
});

const refreshTokenCtrl = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw apiError(401, 'Refresh token required');
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) throw apiError(401, 'Invalid refresh token');
    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    user.refreshToken = newRefreshToken;
    await user.save();
    res.json({ success: true, data: { token: newToken, refreshToken: newRefreshToken }, timestamp: new Date().toISOString() });
  } catch { throw apiError(401, 'Invalid refresh token'); }
});

const logout = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.refreshToken = null;
  await user.save();
  res.json({ success: true, message: 'Logged out successfully', timestamp: new Date().toISOString() });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  const user = await User.findOne({ phone });
  if (!user) throw apiError(404, 'User not found');
  const otp = generateOTP();
  await OTPVerification.create({ phone, otp, type: 'reset_password', expiresAt: new Date(Date.now() + 10 * 60 * 1000) });
  await sendSMS(phone, `Your TENA password reset code is: ${otp}. Valid for 10 minutes.`);
  const response = { success: true, message: 'OTP sent to your phone', timestamp: new Date().toISOString() };
  if (isDev) response.data = { devOtp: otp };
  res.json(response);
});

const resetPassword = asyncHandler(async (req, res) => {
  const { phone, otp, newPassword } = req.body;
  const otpRecord = await OTPVerification.findOne({ phone, otp, type: 'reset_password', isVerified: false, expiresAt: { $gt: new Date() } });
  if (!otpRecord) throw apiError(400, 'Invalid or expired OTP');
  otpRecord.isVerified = true;
  await otpRecord.save();
  const user = await User.findOne({ phone });
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password reset successfully', timestamp: new Date().toISOString() });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password -refreshToken');
  res.json({ success: true, data: user, timestamp: new Date().toISOString() });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, location, settings } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { $set: { name, email, location, settings } }, { new: true, runValidators: true }).select('-password -refreshToken');
  res.json({ success: true, data: user, timestamp: new Date().toISOString() });
});

module.exports = { register, verifyOTP, login, refreshToken: refreshTokenCtrl, logout, forgotPassword, resetPassword, getMe, updateProfile };
