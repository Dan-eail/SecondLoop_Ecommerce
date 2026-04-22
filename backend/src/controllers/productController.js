const Product = require('../models/Product');
const User = require('../models/User');
const { Wishlist } = require('../models/index');
const { isCloudinaryConfigured, uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const { apiError } = require('../utils/apiError');
const { asyncHandler } = require('../utils/asyncHandler');
const fs = require('fs/promises');
const path = require('path');

const localImageUrl = (req, filename) => `${req.protocol}://${req.get('host')}/uploads/products/${filename}`;

const getProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, sort = 'createdAt', order = 'desc', category, minPrice, maxPrice, condition, city, q, minRating, isFeatured } = req.query;
  const query = { status: 'active' };
  if (q) query.$text = { $search: q };
  if (category) query.category = category;
  if (minPrice || maxPrice) { query.price = {}; if (minPrice) query.price.$gte = Number(minPrice); if (maxPrice) query.price.$lte = Number(maxPrice); }
  if (condition) query.condition = condition;
  if (city) query['location.city'] = city;
  if (isFeatured === 'true') query.isFeatured = true;
  if (minRating) {
    const users = await User.find({ rating: { $gte: Number(minRating) } }).select('_id');
    query.seller = { $in: users.map(u => u._id) };
  }
  const sortOrder = order === 'asc' ? 1 : -1;
  const sortOptions = {};
  if (sort === 'price') sortOptions.price = sortOrder;
  else if (sort === 'viewCount') sortOptions.viewCount = sortOrder;
  else sortOptions.createdAt = sortOrder;
  const products = await Product.find(query).populate('seller', 'name rating profileImage').sort(sortOptions).limit(limit * 1).skip((page - 1) * limit);
  const total = await Product.countDocuments(query);
  res.json({ success: true, data: { products, pagination: { currentPage: Number(page), totalPages: Math.ceil(total / limit), totalItems: total, itemsPerPage: Number(limit) } }, timestamp: new Date().toISOString() });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('seller', 'name phone rating totalReviews profileImage location isIdentityVerified createdAt');
  if (!product) throw apiError(404, 'Product not found');
  product.viewCount += 1;
  await product.save();
  res.json({ success: true, data: product, timestamp: new Date().toISOString() });
});

const createProduct = asyncHandler(async (req, res) => {
  const { title, description, price, category, condition, negotiable, originalPrice, subcategory, tags } = req.body;
  const location = req.body.location ? (typeof req.body.location === 'string' ? JSON.parse(req.body.location) : req.body.location) : { city: req.user.location?.city || 'Addis Ababa' };
  const images = [];
  if (req.files && req.files.length > 0) {
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      if (isCloudinaryConfigured() && file.buffer) {
        const result = await uploadToCloudinary(file.buffer, 'products');
        images.push({ url: result.secure_url, publicId: result.public_id, order: i });
      } else if (file.filename) {
        images.push({ url: localImageUrl(req, file.filename), publicId: `local:${file.filename}`, order: i });
      }
    }
  }
  const product = await Product.create({ title, description, price: Number(price), category, condition, location, seller: req.user._id, images, negotiable: negotiable === 'true' || negotiable === true, originalPrice: originalPrice || undefined, subcategory, tags: tags ? (Array.isArray(tags) ? tags : tags.split(',')) : [] });
  await User.findByIdAndUpdate(req.user._id, { $inc: { totalListings: 1 }, role: 'seller' });
  res.status(201).json({ success: true, data: { productId: product._id, slug: product.slug, status: product.status, message: 'Product listed successfully' }, timestamp: new Date().toISOString() });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw apiError(404, 'Product not found');
  if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') throw apiError(403, 'Not authorized');
  const updates = { ...req.body };
  if (req.files && req.files.length > 0) {
    const newImages = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      if (isCloudinaryConfigured() && file.buffer) {
        const result = await uploadToCloudinary(file.buffer, 'products');
        newImages.push({ url: result.secure_url, publicId: result.public_id, order: i });
      } else if (file.filename) {
        newImages.push({ url: localImageUrl(req, file.filename), publicId: `local:${file.filename}`, order: i });
      }
    }
    updates.images = newImages;
  }
  const updated = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
  res.json({ success: true, data: updated, timestamp: new Date().toISOString() });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw apiError(404, 'Product not found');
  if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') throw apiError(403, 'Not authorized');
  for (const image of product.images) {
    if (!image.publicId) continue;
    if (image.publicId.startsWith('local:')) {
      const filename = image.publicId.replace(/^local:/, '');
      const filePath = path.join(process.cwd(), 'uploads', 'products', filename);
      try { await fs.unlink(filePath); } catch (_) { /* ignore */ }
      continue;
    }
    await deleteFromCloudinary(image.publicId);
  }
  await product.deleteOne();
  await User.findByIdAndUpdate(req.user._id, { $inc: { totalListings: -1 } });
  res.json({ success: true, message: 'Product deleted successfully', timestamp: new Date().toISOString() });
});

const getUserProducts = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = { seller: req.params.userId };
  if (status) query.status = status;
  else if (req.params.userId !== req.user?._id?.toString()) query.status = 'active';
  const products = await Product.find(query).sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit);
  const total = await Product.countDocuments(query);
  res.json({ success: true, data: { products, pagination: { currentPage: Number(page), totalPages: Math.ceil(total / limit), totalItems: total } }, timestamp: new Date().toISOString() });
});

const toggleWishlist = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw apiError(404, 'Product not found');
  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  const idx = wishlist.products.indexOf(req.params.id);
  let action;
  if (idx > -1) { wishlist.products.splice(idx, 1); action = 'removed'; await Product.findByIdAndUpdate(req.params.id, { $inc: { saveCount: -1 } }); }
  else { wishlist.products.push(req.params.id); action = 'added'; await Product.findByIdAndUpdate(req.params.id, { $inc: { saveCount: 1 } }); }
  await wishlist.save();
  res.json({ success: true, data: { action }, message: `Product ${action} from wishlist`, timestamp: new Date().toISOString() });
});

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getUserProducts, toggleWishlist };
