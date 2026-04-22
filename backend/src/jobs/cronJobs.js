const cron = require('node-cron');
const Product = require('../models/Product');
const Order = require('../models/Order');

const expireOldProducts = async () => {
  try {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const result = await Product.updateMany({ createdAt: { $lt: sixtyDaysAgo }, status: 'active' }, { status: 'archived' });
    console.log(`[CRON] Expired ${result.modifiedCount} products`);
  } catch (err) { console.error('[CRON] expireOldProducts error:', err); }
};

const autoReleaseEscrow = async () => {
  try {
    const orders = await Order.find({ escrowStatus: 'held', escrowReleasedAt: { $lt: new Date() }, status: 'delivered' });
    for (const order of orders) {
      order.escrowStatus = 'released';
      order.status = 'completed';
      order.completedAt = new Date();
      order.statusHistory.push({ status: 'completed', note: 'Escrow auto-released after 48 hours' });
      await order.save();
      console.log(`[CRON] Auto-released escrow for order ${order.orderNumber}`);
    }
  } catch (err) { console.error('[CRON] autoReleaseEscrow error:', err); }
};

const cleanupExpiredOTPs = async () => {
  try {
    const { OTPVerification } = require('../models/index');
    const result = await OTPVerification.deleteMany({ expiresAt: { $lt: new Date() } });
    console.log(`[CRON] Cleaned ${result.deletedCount} expired OTPs`);
  } catch (err) { console.error('[CRON] cleanupExpiredOTPs error:', err); }
};

const start = () => {
  cron.schedule('0 0 * * *', expireOldProducts);       // Daily midnight
  cron.schedule('0 */2 * * *', autoReleaseEscrow);     // Every 2 hours
  cron.schedule('0 */6 * * *', cleanupExpiredOTPs);    // Every 6 hours
  console.log('✅ Cron jobs started');
};

module.exports = { start };
