const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 10, maxlength: 100 },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, required: true, maxlength: 2000, minlength: 50 },
  price: { type: Number, required: true, min: 1, max: 1000000 },
  originalPrice: Number,
  negotiable: { type: Boolean, default: true },
  category: { type: String, required: true, index: true },
  subcategory: String,
  condition: { type: String, enum: ['new', 'like_new', 'good', 'fair', 'for_parts'], required: true },
  tags: [String],
  images: [{ url: String, publicId: String, order: Number }],
  video: String,
  location: {
    city: { type: String, required: true },
    subcity: String,
    coordinates: [Number],
    formattedAddress: String,
  },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: {
    type: String,
    enum: ['draft', 'active', 'sold', 'archived', 'flagged', 'banned'],
    default: 'active',
    index: true,
  },
  isFeatured: { type: Boolean, default: false },
  isUrgent: { type: Boolean, default: false },
  viewCount: { type: Number, default: 0 },
  inquiryCount: { type: Number, default: 0 },
  saveCount: { type: Number, default: 0 },
  deliveryOptions: {
    pickup: { type: Boolean, default: true },
    delivery: { type: Boolean, default: false },
    deliveryFee: Number,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 60 * 24 * 60 * 60 * 1000),
  },
}, { timestamps: true });

productSchema.pre('validate', function(next) {
  // `slug` is required; generate it before mongoose validation runs.
  if ((!this.slug || this.isModified('title')) && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now();
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
