const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const routes = require('./routes');
const { errorMiddleware } = require('./middleware/errorMiddleware');
const { securityMiddleware } = require('./middleware/securityMiddleware');

const app = express();
const defaultDevOrigins = ['http://localhost:3000', 'http://localhost:3001'];
const envOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : [];
const configuredOrigins = process.env.NODE_ENV === 'development'
  ? [...new Set([...defaultDevOrigins, ...envOrigins])]
  : envOrigins;
const isAllowedOrigin = (origin) => !origin || configuredOrigins.includes(origin);

// Security middleware
app.use(
  helmet({
    // Frontend dev server (localhost:3000) loads images from API (localhost:5000)
    // so we must allow cross-origin resource usage for assets like `/uploads/*`.
    crossOriginResourcePolicy: {
      policy: process.env.NODE_ENV === 'development' ? 'cross-origin' : 'same-origin',
    },
  })
);
app.use(securityMiddleware);

// CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// Routes
app.use('/api/v1', routes);

// Serve local uploads (dev fallback when Cloudinary isn't configured)
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});
app.use(
  '/uploads',
  express.static(path.join(process.cwd(), 'uploads'), {
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  })
);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Error handling
app.use(errorMiddleware);

module.exports = app;
