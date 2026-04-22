const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  getAdminAnalytics,
} = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middleware/auth');

// All analytics routes require authentication
router.use(authenticate);

// User analytics
router.get('/', getAnalytics);

// Admin-only analytics
router.get(
  '/admin',
  authorize('admin'),
  getAdminAnalytics
);

module.exports = router;
