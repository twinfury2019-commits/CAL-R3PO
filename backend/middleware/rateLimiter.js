const rateLimit = require('express-rate-limit');

const verifyLimiter = rateLimit({
  windowMs:       15 * 60 * 1000, // 15 minutes
  max:            30,              // 30 requests per IP per window
  standardHeaders: true,
  legacyHeaders:  false,
  message: {
    success: false,
    message: 'Too many verification requests from this IP. Please try again after 15 minutes.'
  }
});

module.exports = { verifyLimiter };
