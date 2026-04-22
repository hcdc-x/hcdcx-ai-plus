const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many requests, please try again later.',
  },
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json(options.message);
  },
  skip: (req) => {
    // Skip rate limiting for admin users (optional)
    return req.user?.role === 'admin';
  },
});

/**
 * Stricter limiter for authentication endpoints
 * 5 requests per minute per IP
 */
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many authentication attempts, please try again after a minute.',
  },
  handler: (req, res, next, options) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json(options.message);
  },
});

/**
 * Code generation limiter
 * 10 requests per minute per user
 */
const generationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: {
    message: 'Code generation limit reached. Please wait a moment.',
  },
});

module.exports = {
  rateLimiter,
  authLimiter,
  generationLimiter,
};
