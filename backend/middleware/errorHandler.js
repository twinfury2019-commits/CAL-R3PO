const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${err.name}: ${err.message}`);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  // Mongoose duplicate key (unique constraint)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    return res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists`,
      errors:  [`${field}: '${value}' is already registered`]
    });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path} format`,
      errors:  [`${err.path}: '${err.value}' is not a valid ID`]
    });
  }

  const isProd = process.env.NODE_ENV === 'production';
  const status  = err.status || 500;
  res.status(status).json({
    success: false,
    message: status === 500 && isProd ? 'Internal server error' : (err.message || 'Internal server error')
  });
};

module.exports = errorHandler;
