const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Product = require('../models/Product');

const ETHIOPIAN_CITIES = ['Addis Ababa', 'Dire Dawa', 'Hawassa', 'Bahir Dar', 'Mekelle'];
const CATEGORIES = ['Electronics', 'Furniture', 'Clothing', 'Books', 'Home Appliances', 'Vehicles', 'Sports & Outdoors', 'Baby & Kids'];

const makeSlug = (title, suffix) =>
  `${title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') + `-${suffix}`;

const seedUsers = async () => {
  await User.deleteMany({});
  const users = [
    { phone: '+251911111111', name: 'Admin TENA', password: 'Admin@1234', location: { city: 'Addis Ababa' }, role: 'admin', isPhoneVerified: true, status: 'active' },
    { phone: '+251922222222', name: 'Abebe Kebede', password: 'Seller@1234', location: { city: 'Addis Ababa', subcity: 'Bole' }, role: 'seller', isPhoneVerified: true, status: 'active', rating: 4.5, totalReviews: 12 },
    { phone: '+251933333333', name: 'Tigist Haile', password: 'User@12345', location: { city: 'Addis Ababa', subcity: 'Kazanchis' }, role: 'seller', isPhoneVerified: true, status: 'active', rating: 4.8, totalReviews: 7 },
    { phone: '+251944444444', name: 'Dawit Bekele', password: 'User@12345', location: { city: 'Hawassa' }, role: 'user', isPhoneVerified: true, status: 'active' },
    { phone: '+251955555555', name: 'Sara Girma', password: 'User@12345', location: { city: 'Dire Dawa' }, role: 'seller', isPhoneVerified: true, status: 'active', rating: 4.2, totalReviews: 3 },
  ];
  const created = await User.create(users);
  console.log(`✅ Seeded ${created.length} users`);
  return created;
};

const seedProducts = async (users) => {
  await Product.deleteMany({});
  const seller1 = users.find(u => u.phone === '+251922222222');
  const seller2 = users.find(u => u.phone === '+251933333333');
  const seller3 = users.find(u => u.phone === '+251955555555');

  const products = [
    { title: 'Samsung Galaxy S21 Used Good Condition', description: 'Samsung Galaxy S21 in good condition. Minor scratches on screen but fully functional. Comes with original charger and box. Battery health at 89%.', price: 28000, category: 'Electronics', subcategory: 'Phones', condition: 'good', seller: seller1._id, location: { city: 'Addis Ababa', subcity: 'Bole' }, images: [{ url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400', publicId: 'phone1', order: 0 }], negotiable: true, isFeatured: true },
    { title: 'MacBook Pro 2020 Intel Core i5 Excellent Condition', description: 'MacBook Pro 2020 model with Intel Core i5 processor, 8GB RAM and 256GB SSD. Excellent condition with minimal use. Perfect for developers and designers.', price: 85000, category: 'Electronics', subcategory: 'Laptops', condition: 'like_new', seller: seller1._id, location: { city: 'Addis Ababa', subcity: 'Kazanchis' }, images: [{ url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400', publicId: 'laptop1', order: 0 }], negotiable: false, isFeatured: true },
    { title: 'Wooden Dining Table Set Six Chairs', description: 'Beautiful solid wood dining table with 6 matching chairs. Excellent craftsmanship, slight wear on one chair. Perfect for family dining room. Dimensions: 180x90cm table.', price: 18500, category: 'Furniture', subcategory: 'Tables', condition: 'good', seller: seller2._id, location: { city: 'Addis Ababa', subcity: 'Piassa' }, images: [{ url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400', publicId: 'furniture1', order: 0 }], negotiable: true },
    { title: 'LG Double Door Refrigerator 400 Liters', description: 'LG double door refrigerator 400L capacity. Works perfectly, selling because upgrading. Energy efficient, cold zones working great. Available for pickup or delivery in Addis.', price: 32000, category: 'Home Appliances', subcategory: 'Refrigerators', condition: 'good', seller: seller2._id, location: { city: 'Addis Ababa', subcity: 'Bole' }, images: [{ url: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400', publicId: 'appliance1', order: 0 }], negotiable: true, isFeatured: true },
    { title: 'Honda CRV 2016 Excellent Condition Low Mileage', description: 'Honda CRV 2016 in excellent condition. Only 65,000km driven. Full service history, no accidents. New tires, brakes done 5000km ago. Price is negotiable for serious buyers.', price: 980000, category: 'Vehicles', subcategory: 'Cars', condition: 'like_new', seller: seller3._id, location: { city: 'Dire Dawa' }, images: [{ url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400', publicId: 'car1', order: 0 }], negotiable: true, isFeatured: true },
    { title: 'Traditional Ethiopian Habesha Kemis Dress New', description: 'Beautiful traditional Ethiopian Habesha Kemis dress, brand new with tags. Size medium. Perfect for weddings and celebrations. High quality embroidery work.', price: 3500, category: 'Clothing', subcategory: 'Traditional', condition: 'new', seller: seller1._id, location: { city: 'Addis Ababa', subcity: 'Merkato' }, images: [{ url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400', publicId: 'cloth1', order: 0 }], negotiable: false },
    { title: 'University Textbooks Engineering Mathematics Collection', description: 'Collection of engineering mathematics textbooks for AAU students. Includes Calculus, Linear Algebra, and Differential Equations. All in good readable condition with minimal highlights.', price: 1200, category: 'Books', subcategory: 'Textbooks', condition: 'good', seller: seller2._id, location: { city: 'Addis Ababa', subcity: 'Kazanchis' }, images: [{ url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400', publicId: 'books1', order: 0 }], negotiable: true },
    { title: 'Treadmill Gym Quality Barely Used Like New', description: 'Professional quality treadmill, bought 6 months ago and used less than 10 times. Folds for storage. Max speed 16km/h, has incline settings. Original price 45,000 ETB.', price: 28000, category: 'Sports & Outdoors', subcategory: 'Fitness', condition: 'like_new', seller: seller3._id, location: { city: 'Dire Dawa' }, images: [{ url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', publicId: 'sports1', order: 0 }], negotiable: true },
  ];

  const seedSuffix = `${Date.now()}`;
  const productsWithSlugs = products.map((p, idx) => ({
    ...p,
    slug: makeSlug(p.title, `${seedSuffix}-${idx}`),
  }));

  const created = await Product.insertMany(productsWithSlugs, { ordered: true });
  console.log(`✅ Seeded ${created.length} products`);
};

const runAllSeeders = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is required for seeding');

    const maxAttempts = Number(process.env.MONGODB_CONNECT_RETRIES || 20);
    const delayMs = Number(process.env.MONGODB_CONNECT_RETRY_DELAY_MS || 1500);
    let lastErr;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await mongoose.connect(uri);
        lastErr = null;
        break;
      } catch (err) {
        lastErr = err;
        console.log(`Mongo not ready (attempt ${attempt}/${maxAttempts})...`);
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
    if (lastErr) throw lastErr;

    console.log('Connected to MongoDB for seeding...');
    const users = await seedUsers();
    await seedProducts(users);
    console.log('🎉 All seeders completed!');
    console.log('Admin: +251911111111 / Admin@1234');
    console.log('Seller: +251922222222 / Seller@1234');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

runAllSeeders();
