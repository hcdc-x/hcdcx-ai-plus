const express = require('express');
const router = express.Router();
const {
  verifyScan,
  getRecentScans,
  getScanStats,
} = require('../controllers/scanController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validate, validationRules } = require('../middleware/validation');

// Scan verification can be public or authenticated (better data if authenticated)
router.post(
  '/verify',
  optionalAuth,
  validate(validationRules.scanVerify),
  verifyScan
);

// Protected routes
router.use(authenticate);

router.get(
  '/recent',
  validate(validationRules.pagination),
  getRecentScans
);

router.get('/stats', getScanStats);

module.exports = router;
