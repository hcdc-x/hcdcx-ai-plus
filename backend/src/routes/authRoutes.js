const express = require('express');
const router = express.Router();
const {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  enableOTP,
  verifyOTP,
  disableOTP,
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');
const { validate, validationRules } = require('../middleware/validation');

// Public routes
router.post(
  '/register',
  authLimiter,
  validate(validationRules.register),
  register
);

router.post(
  '/login',
  authLimiter,
  validate(validationRules.login),
  login
);

router.post('/refresh', refreshToken);

router.post('/logout', logout);

// Protected routes (require authentication)
router.use(authenticate);

router.get('/profile', getProfile);
router.patch('/profile', updateProfile);

// OTP routes
router.post('/otp/enable', enableOTP);
router.post(
  '/otp/verify',
  validate(validationRules.verifyOTP),
  verifyOTP
);
router.post(
  '/otp/disable',
  validate(validationRules.verifyOTP),
  disableOTP
);

module.exports = router;
