const router = require('express').Router();
const { body } = require('express-validator');
const { login, createUser }    = require('../controllers/authController');
const { protect, requireRole } = require('../middleware/auth');
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

router.post('/login',       validate(loginFields), login);
router.post('/create-user', protect, requireRole('admin'), validate(createUserFields), createUser);

// TEMP — remove after use
const User = require('../models/User');
router.delete('/delete-user/:username', protect, requireRole('admin'), async (req, res) => {
  const user = await User.findOneAndDelete({ username: req.params.username.toLowerCase() });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, message: `Deleted user: ${user.username}` });
});

module.exports = router;
