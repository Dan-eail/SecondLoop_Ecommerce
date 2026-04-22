const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 1, min: 1 },
  unitPrice: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  deliveryMethod: { type: String, enum: ['pickup', 'delivery'], required: true },
  deliveryAddress: { city: String, subcity: String, landmark: String, phone: String, instructions: String },
  deliveryTracking: { courier: String, trackingNumber: String, estimatedDelivery: Date, deliveredAt: Date },
  paymentMethod: { type: String, enum: ['telebirr', 'cash_on_delivery', 'bank_transfer'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  paymentProof: { imageUrl: String, uploadedAt: Date, verifiedBy: mongoose.Schema.Types.ObjectId, verifiedAt: Date },
  escrowStatus: { type: String, enum: ['pending', 'held', 'released', 'refunded', 'disputed'], default: 'pending' },
  escrowReleasedAt: Date,
  status: {
    type: String,
    enum: ['pending_payment', 'payment_verified', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded', 'disputed'],
    default: 'pending_payment',
    index: true,
  },
  statusHistory: [{ status: String, note: String, createdAt: { type: Date, default: Date.now } }],
  dispute: {
    filedBy: mongoose.Schema.Types.ObjectId,
    reason: String,
    description: String,
    evidence: [String],
    filedAt: Date,
    resolvedBy: mongoose.Schema.Types.ObjectId,
    resolution: String,
    resolvedAt: Date,
  },
  platformFee: { type: Number, required: true },
  sellerPayout: { type: Number, required: true },
  completedAt: Date,
  cancelledAt: Date,
}, { timestamps: true });

orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `TENA-${year}${month}${day}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
