const { validationResult } = require('express-validator');

// Runs a chain of express-validator checks, returns 400 with clean errors on failure
const validate = (checks) => async (req, res, next) => {
  for (const check of checks) await check.run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors:  errors.array().map(e => `${e.path}: ${e.msg}`)
    });
  }
  next();
};

module.exports = validate;
