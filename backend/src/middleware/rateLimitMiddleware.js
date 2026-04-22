const rateLimit = require('express-rate-limit');
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 5,
  message: 'Too many authentication attempts, please try again after 15 minutes',
  skipSuccessfulRequests: true,
});
const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 100, message: 'Too many requests' });
const searchLimiter = rateLimit({ windowMs: 60 * 1000, max: 60, message: 'Too many search requests' });
module.exports = { authLimiter, apiLimiter, searchLimiter };
