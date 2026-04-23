const router = require('express').Router();
const { login, createUser } = require('../controllers/authController');
const { protect, requireRole } = require('../middleware/auth');

router.post('/login', login);

// Only an existing admin can create new users
router.post('/create-user', protect, requireRole('admin'), createUser);

module.exports = router;
