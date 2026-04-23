const router  = require('express').Router();
const { body, param } = require('express-validator');
const {
  verifyByCnic,
  createLicense,
  updateLicense,
  deleteLicense,
  getAllLicenses
} = require('../controllers/licenseController');
const { protect, requireRole } = require('../middleware/auth');
const { verifyLimiter }        = require('../middleware/rateLimiter');
const validate                 = require('../middleware/validate');

// ── Validation chains ──────────────────────────────────────────────────────

const cnicParam = [
  param('cnic')
    .trim()
    .matches(/^\d{13}$/)
    .withMessage('CNIC must be exactly 13 digits with no dashes or spaces')
];

const licenseFields = [
  body('cnic')
    .trim()
    .matches(/^\d{13}$/)
    .withMessage('CNIC must be exactly 13 digits with no dashes or spaces'),

  body('name')
    .trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),

  body('fatherName')
    .trim().notEmpty().withMessage('Father name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Father name must be 2–100 characters'),

  body('address')
    .trim().notEmpty().withMessage('Address is required')
    .isLength({ min: 5, max: 200 }).withMessage('Address must be 5–200 characters'),

  body('licenseNo')
    .trim().notEmpty().withMessage('License number is required'),

  body('weaponNo')
    .trim().notEmpty().withMessage('Weapon number is required'),

  body('weaponType')
    .trim().notEmpty().withMessage('Weapon type is required'),

  body('issueDate')
    .isISO8601().withMessage('Issue date must be a valid date (YYYY-MM-DD)'),

  body('expiryDate')
    .isISO8601().withMessage('Expiry date must be a valid date (YYYY-MM-DD)')
    .custom((val, { req }) => {
      if (new Date(val) <= new Date(req.body.issueDate)) {
        throw new Error('Expiry date must be after issue date');
      }
      return true;
    }),

  body('licenseType')
    .isIn(['Balochistan', 'All Pakistan'])
    .withMessage('License type must be "Balochistan" or "All Pakistan"')
];

// ── Routes ────────────────────────────────────────────────────────────────

// Public — rate limited + CNIC format validated
router.get('/verify/:cnic', verifyLimiter, validate(cnicParam), verifyByCnic);

// Admin & Operator — all fields validated
router.post('/license', protect, requireRole('admin', 'operator'), validate(licenseFields), createLicense);

// Update — CNIC not required on update, other fields still validated if provided
router.put('/license/:id', protect, requireRole('admin', 'operator'), updateLicense);

// Admin only
router.delete('/license/:id', protect, requireRole('admin'), deleteLicense);
router.get('/licenses', protect, requireRole('admin'), getAllLicenses);

module.exports = router;
