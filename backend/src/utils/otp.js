const { authenticator } = require('otplib');
const QRCode = require('qrcode');
const logger = require('./logger');

/**
 * Generate TOTP secret and QR code URI
 * @param {string} email - User email
 * @returns {Object} Secret and QR code data URL
 */
const generateTOTP = async (email) => {
  try {
    const secret = authenticator.generateSecret();
    const issuer = process.env.TOTP_ISSUER || 'HCDCX-AI';
    const otpauth = authenticator.keyuri(email, issuer, secret);
    const qrCode = await QRCode.toDataURL(otpauth);

    return {
      secret,
      otpauth,
      qrCode,
    };
  } catch (error) {
    logger.error(`TOTP generation failed: ${error.message}`);
    throw error;
  }
};

/**
 * Verify TOTP token
 * @param {string} token - 6-digit token
 * @param {string} secret - TOTP secret
 * @returns {boolean} Valid or not
 */
const verifyTOTP = (token, secret) => {
  try {
    return authenticator.verify({ token, secret });
  } catch (error) {
    logger.debug(`TOTP verification error: ${error.message}`);
    return false;
  }
};

/**
 * Generate a numeric TOTP token (for testing/fallback)
 * @param {string} secret - TOTP secret
 * @returns {string} 6-digit token
 */
const generateToken = (secret) => {
  return authenticator.generate(secret);
};

/**
 * Check if TOTP secret is valid format
 * @param {string} secret - TOTP secret
 * @returns {boolean}
 */
const isValidSecret = (secret) => {
  try {
    return authenticator.verify({
      token: authenticator.generate(secret),
      secret,
    });
  } catch {
    return false;
  }
};

module.exports = {
  generateTOTP,
  verifyTOTP,
  generateToken,
  isValidSecret,
};
