const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, minlength: 10 },
  images: [String],
  response: { text: String, createdAt: Date },
  isHelpful: { type: Number, default: 0 },
}, { timestamps: true });
reviewSchema.index({ order: 1, reviewer: 1 }, { unique: true });

const messageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  attachments: [{ type: String, url: String }],
  isRead: { type: Boolean, default: false },
  readAt: Date,
  isDeleted: { type: Boolean, default: false },
  type: { type: String, enum: ['text', 'image', 'offer', 'system'], default: 'text' },
  offerAmount: Number,
}, { timestamps: true });
messageSchema.index({ conversation: 1, createdAt: -1 });

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  lastMessage: { content: String, sender: mongoose.Schema.Types.ObjectId, createdAt: Date },
  unreadCount: { type: Map, of: Number, default: {} },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
conversationSchema.index({ participants: 1 });

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, default: 1, min: 1 },
    price: Number,
    addedAt: { type: Date, default: Date.now },
  }],
  totalAmount: { type: Number, default: 0 },
}, { timestamps: true });
cartSchema.pre('save', function(next) {
  this.totalAmount = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  next();
});

const wishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
}, { timestamps: true });

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['order', 'message', 'payment', 'review', 'system', 'promotion'], required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  actionUrl: String,
  isRead: { type: Boolean, default: false },
  readAt: Date,
}, { timestamps: true });

const otpSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  otp: { type: String, required: true },
  type: { type: String, enum: ['register', 'reset_password', 'login'], required: true },
  expiresAt: { type: Date, required: true },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const transactionSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  type: { type: String, enum: ['escrow_hold', 'escrow_release', 'refund', 'fee'], required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  reference: String,
  completedAt: Date,
}, { timestamps: true });

module.exports = {
  Review: mongoose.model('Review', reviewSchema),
  Message: mongoose.model('Message', messageSchema),
  Conversation: mongoose.model('Conversation', conversationSchema),
  Cart: mongoose.model('Cart', cartSchema),
  Wishlist: mongoose.model('Wishlist', wishlistSchema),
  Notification: mongoose.model('Notification', notificationSchema),
  OTPVerification: mongoose.model('OTPVerification', otpSchema),
  Transaction: mongoose.model('Transaction', transactionSchema),
};
