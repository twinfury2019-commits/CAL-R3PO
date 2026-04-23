const router = require('express').Router();
const {
  verifyByCnic,
  createLicense,
  updateLicense,
  getAllLicenses
} = require('../controllers/licenseController');
const { protect, requireRole } = require('../middleware/auth');

// Public
router.get('/verify/:cnic', verifyByCnic);

// Admin & Operator
router.post('/license', protect, requireRole('admin', 'operator'), createLicense);
router.put('/license/:id', protect, requireRole('admin', 'operator'), updateLicense);

// Admin only
router.get('/licenses', protect, requireRole('admin'), getAllLicenses);

module.exports = router;
