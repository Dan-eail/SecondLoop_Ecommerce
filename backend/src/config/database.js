const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    await createIndexes();
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    await mongoose.connection.collection('users').createIndex({ phone: 1 }, { unique: true });
    await mongoose.connection.collection('users').createIndex({ rating: -1 });
    await mongoose.connection.collection('products').createIndex(
      { title: 'text', description: 'text', tags: 'text' },
      { weights: { title: 10, tags: 5, description: 1 } }
    );
    await mongoose.connection.collection('products').createIndex({ price: 1, createdAt: -1 });
    await mongoose.connection.collection('products').createIndex({ category: 1, status: 1 });
    await mongoose.connection.collection('products').createIndex({ seller: 1, status: 1 });
    await mongoose.connection.collection('products').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    await mongoose.connection.collection('orders').createIndex({ buyer: 1, createdAt: -1 });
    await mongoose.connection.collection('orders').createIndex({ seller: 1, status: 1 });
    await mongoose.connection.collection('orders').createIndex({ orderNumber: 1 }, { unique: true });
    await mongoose.connection.collection('otpverifications').createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 600 }
    );
    console.log('✅ Database indexes created');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
};

module.exports = connectDB;
