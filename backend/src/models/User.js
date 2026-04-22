const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true, trim: true, match: /^\+251[0-9]{9}$/ },
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  email: { type: String, lowercase: true, trim: true, sparse: true },
  password: { type: String, required: true, minlength: 6 },
  profileImage: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  location: {
    city: { type: String, required: true },
    subcity: String,
    woreda: String,
    coordinates: [Number],
    formattedAddress: String,
  },
  isPhoneVerified: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  isIdentityVerified: { type: Boolean, default: false },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  totalListings: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 },
  totalPurchases: { type: Number, default: 0 },
  responseRate: { type: Number, default: 0 },
  responseTime: { type: Number, default: 0 },
  role: { type: String, enum: ['user', 'seller', 'admin'], default: 'user' },
  status: { type: String, enum: ['active', 'suspended', 'banned'], default: 'active' },
  settings: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
    },
    privacy: {
      showPhone: { type: Boolean, default: false },
      showEmail: { type: Boolean, default: false },
    },
    language: { type: String, enum: ['am', 'en'], default: 'en' },
  },
  lastLogin: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  refreshToken: String,
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isLocked = function() {
  return this.lockUntil && this.lockUntil > Date.now();
};

module.exports = mongoose.model('User', userSchema);
