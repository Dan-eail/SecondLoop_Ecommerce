const { validationResult } = require('express-validator');
const { apiError } = require('../utils/apiError');
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg);
    throw apiError(400, 'Validation failed', { errors: errorMessages });
  }
  next();
};
module.exports = { validate };
