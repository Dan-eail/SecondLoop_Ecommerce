const apiError = (statusCode, message, data = null) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (data) error.data = data;
  return error;
};
module.exports = { apiError };
