const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { authenticator } = require('otplib');
const QRCode = require('qrcode');
const User = require('../models/User');
const Token = require('../models/Token');
const logger = require('../utils/logger');
const { sendVerificationEmail } = require('../services/emailService');

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token
    await Token.create({
      userId: user._id,
      token: refreshToken,
      type: 'refresh',
    });

    // Send verification email (optional)
    // await sendVerificationEmail(email, user._id);

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token
    await Token.create({
      userId: user._id,
      token: refreshToken,
      type: 'refresh',
    });

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    logger.info(`User logged in: ${email}`);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        otpEnabled: user.otpEnabled,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    // Verify token exists in DB
    const tokenDoc = await Token.findOne({ token: refreshToken, type: 'refresh' });
    if (!tokenDoc) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Verify JWT
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);

    // Replace refresh token
    await Token.findOneAndDelete({ token: refreshToken });
    await Token.create({
      userId: decoded.userId,
      token: newRefreshToken,
      type: 'refresh',
    });

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await Token.findOneAndDelete({ token: refreshToken });
    }

    logger.info(`User logged out: ${req.user?.email || 'unknown'}`);

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-__v');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      otpEnabled: user.otpEnabled,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PATCH /api/auth/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) {
      const existing = await User.findOne({ email });
      if (existing && existing._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email;
    }

    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      otpEnabled: user.otpEnabled,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Enable OTP (TOTP) for user
// @route   POST /api/auth/otp/enable
exports.enableOTP = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.otpEnabled) {
      return res.status(400).json({ message: 'OTP already enabled' });
    }

    // Generate TOTP secret
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(user.email, process.env.TOTP_ISSUER, secret);

    // Save secret temporarily (not enabled yet)
    user.tempOtpSecret = secret;
    await user.save();

    // Generate QR code
    const qrCodeDataURL = await QRCode.toDataURL(otpauth);

    res.json({
      secret,
      qrCode: qrCodeDataURL,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify and enable OTP
// @route   POST /api/auth/otp/verify
exports.verifyOTP = async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.id);

    if (!user || !user.tempOtpSecret) {
      return res.status(400).json({ message: 'OTP setup not initiated' });
    }

    // Verify token
    const isValid = authenticator.verify({ token, secret: user.tempOtpSecret });
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid OTP code' });
    }

    // Enable OTP
    user.otpSecret = user.tempOtpSecret;
    user.otpEnabled = true;
    user.tempOtpSecret = undefined;
    await user.save();

    logger.info(`OTP enabled for user: ${user.email}`);

    res.json({ message: 'OTP enabled successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Disable OTP
// @route   POST /api/auth/otp/disable
exports.disableOTP = async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.id);

    if (!user || !user.otpEnabled) {
      return res.status(400).json({ message: 'OTP not enabled' });
    }

    // Verify token before disabling
    const isValid = authenticator.verify({ token, secret: user.otpSecret });
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid OTP code' });
    }

    user.otpEnabled = false;
    user.otpSecret = undefined;
    await user.save();

    res.json({ message: 'OTP disabled successfully' });
  } catch (error) {
    next(error);
  }
};
