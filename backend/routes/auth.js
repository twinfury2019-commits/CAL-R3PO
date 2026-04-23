const router = require('express').Router();
const { body } = require('express-validator');
const { login, createUser }    = require('../controllers/authController');
const { protect, requireRole } = require('../middleware/auth');
const { loginLimiter }         = require('../middleware/rateLimiter');
const validate                 = require('../middleware/validate');

const loginFields = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const createUserFields = [
  body('username')
    .trim().notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3–30 characters')
    .matches(/^\w+$/).withMessage('Username may only contain letters, numbers, and underscores'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

  body('role')
    .optional()
    .isIn(['admin', 'operator']).withMessage('Role must be "admin" or "operator"')
];

router.post('/login',       loginLimiter, validate(loginFields), login);
router.post('/create-user', protect, requireRole('admin'), validate(createUserFields), createUser);

module.exports = router;
