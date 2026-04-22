const errorMiddleware = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  if (err.name === 'CastError') { error = { statusCode: 404, message: 'Resource not found' }; }
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    error = { statusCode: 400, message: `${field} already exists` };
  }
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { statusCode: 400, message };
  }
  if (err.name === 'JsonWebTokenError') error = { statusCode: 401, message: 'Invalid token' };
  if (err.name === 'TokenExpiredError') error = { statusCode: 401, message: 'Token expired' };
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    error: { code: statusCode, message, ...(process.env.NODE_ENV === 'development' && { stack: err.stack }) },
    timestamp: new Date().toISOString(),
  });
};
module.exports = { errorMiddleware };
