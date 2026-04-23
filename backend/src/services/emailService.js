// backend/src/services/emailService.js
const { Resend } = require('resend');
const logger = require('../utils/logger');

// Initialize Resend with API key
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const DEFAULT_FROM = 'HCDC-X AI+ <noreply.hcdcx@gmail.com>';
const SUPPORT_EMAIL = 'contact.hcdcx@gmail.com';

/**
 * Send an email using Resend
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} [options.from] - Sender email (defaults to DEFAULT_FROM)
 * @returns {Promise<Object>} Resend response
 */
async function sendEmail({ to, subject, html, from = DEFAULT_FROM }) {
  if (!resend) {
    logger.warn('Email service not configured. RESEND_API_KEY missing.');
    logger.debug(`Would send email to ${to}: ${subject}`);
    return { id: 'mock-email', message: 'Email service not configured' };
  }

  try {
    const response = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });
    logger.info(`Email sent to ${to}: ${subject}`);
    return response;
  } catch (error) {
    logger.error(`Failed to send email to ${to}: ${error.message}`);
    throw error;
  }
}

/**
 * Send verification email after registration
 * @param {string} email - User email
 * @param {string} verificationToken - Token for email verification
 * @returns {Promise<Object>}
 */
async function sendVerificationEmail(email, verificationToken) {
  const verificationLink = `${process.env.CLIENT_URL || 'https://hcdcx-ai.netlify.app'}/verify-email?token=${verificationToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', sans-serif; background: #0b0b0f; color: #eef2ff; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: #0f1219; border-radius: 16px; padding: 32px; border: 1px solid rgba(0,255,255,0.1); }
        .logo { font-size: 24px; font-weight: bold; background: linear-gradient(135deg, #00ffff, #0080ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .button { display: inline-block; background: linear-gradient(135deg, #00ffff, #0080ff); color: #000; padding: 12px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0; }
        .link { color: #00ffff; word-break: break-all; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">HCDC-X AI+</div>
        <h2>Verify your email address</h2>
        <p>Thank you for signing up for HCDC-X AI+. Please verify your email address to activate your account.</p>
        <a href="${verificationLink}" class="button">Verify Email</a>
        <p>Or copy and paste this link into your browser:</p>
        <p class="link">${verificationLink}</p>
        <p>This link will expire in 1 hour.</p>
        <div class="footer">
          <p>If you didn't create an account, you can safely ignore this email.</p>
          <p>HCDC-X AI+ · Adaptive HybridCode Platform</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Verify your email - HCDC-X AI+',
    html,
  });
}

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} resetToken - Password reset token
 * @returns {Promise<Object>}
 */
async function sendPasswordResetEmail(email, resetToken) {
  const resetLink = `${process.env.CLIENT_URL || 'https://hcdcx-ai.netlify.app'}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', sans-serif; background: #0b0b0f; color: #eef2ff; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: #0f1219; border-radius: 16px; padding: 32px; border: 1px solid rgba(0,255,255,0.1); }
        .logo { font-size: 24px; font-weight: bold; background: linear-gradient(135deg, #00ffff, #0080ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .button { display: inline-block; background: linear-gradient(135deg, #00ffff, #0080ff); color: #000; padding: 12px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0; }
        .link { color: #00ffff; word-break: break-all; }
        .warning { background: rgba(255,0,0,0.1); padding: 12px; border-radius: 8px; margin: 20px 0; border-left: 3px solid #ff4444; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">HCDC-X AI+</div>
        <h2>Reset your password</h2>
        <p>We received a request to reset your password. Click the button below to set a new password.</p>
        <a href="${resetLink}" class="button">Reset Password</a>
        <p>Or copy and paste this link into your browser:</p>
        <p class="link">${resetLink}</p>
        <div class="warning">
          <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn't request a password reset, please contact support immediately.
        </div>
        <div class="footer">
          <p>HCDC-X AI+ · Adaptive HybridCode Platform</p>
          <p><a href="mailto:${SUPPORT_EMAIL}" style="color: #00ffff;">${SUPPORT_EMAIL}</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Reset your password - HCDC-X AI+',
    html,
  });
}

/**
 * Send security alert notification
 * @param {string} email - User email
 * @param {Object} alertData - Alert details
 * @param {number} alertData.riskScore - Risk score (0-100)
 * @param {string[]} alertData.triggers - Array of trigger reasons
 * @param {string} alertData.ip - IP address
 * @param {string} alertData.location - Approximate location
 * @returns {Promise<Object>}
 */
async function sendSecurityAlert(email, alertData) {
  const { riskScore, triggers = [], ip, location } = alertData;
  const riskLevel = riskScore >= 70 ? 'CRITICAL' : (riskScore >= 40 ? 'MEDIUM' : 'LOW');
  const color = riskScore >= 70 ? '#ff4444' : (riskScore >= 40 ? '#ffaa00' : '#00ffff');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', sans-serif; background: #0b0b0f; color: #eef2ff; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: #0f1219; border-radius: 16px; padding: 32px; border: 1px solid rgba(255,0,0,0.2); }
        .logo { font-size: 24px; font-weight: bold; background: linear-gradient(135deg, #00ffff, #0080ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .alert-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-weight: bold; margin-bottom: 16px; background: ${color}20; color: ${color}; border: 1px solid ${color}40; }
        .score { font-size: 48px; font-weight: bold; color: ${color}; margin: 16px 0; }
        .detail { margin: 8px 0; }
        .button { display: inline-block; background: #0f1219; color: ${color}; padding: 10px 20px; border-radius: 8px; text-decoration: none; border: 1px solid ${color}40; margin-top: 20px; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">HCDC-X AI+</div>
        <span class="alert-badge">🚨 SECURITY ALERT · ${riskLevel}</span>
        <h2>Suspicious activity detected</h2>
        <p>Our zero-trust security system has flagged a scan attempt with elevated risk.</p>
        <div class="score">${riskScore}/100</div>
        <div class="detail"><strong>IP Address:</strong> ${ip}</div>
        <div class="detail"><strong>Location:</strong> ${location}</div>
        <div class="detail"><strong>Triggers:</strong> ${triggers.join(', ')}</div>
        <p style="margin-top: 20px;">If this wasn't you, we recommend reviewing your security settings and enabling OTP if not already active.</p>
        <a href="${process.env.CLIENT_URL || 'https://hcdcx-ai.netlify.app'}/dashboard/security" class="button">View Security Dashboard →</a>
        <div class="footer">
          <p>HCDC-X AI+ Security Team</p>
          <p><a href="mailto:contact.hcdcx@gmail.com" style="color: #00ffff;">contact.hcdcx@gmail.com</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `🚨 Security Alert - Risk Score ${riskScore}/100 - HCDC-X AI+`,
    html,
  });
}

/**
 * Send OTP code email (as backup for TOTP)
 * @param {string} email - User email
 * @param {string} code - 6-digit OTP code
 * @returns {Promise<Object>}
 */
async function sendOTPEmail(email, code) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', sans-serif; background: #0b0b0f; color: #eef2ff; padding: 20px; }
        .container { max-width: 400px; margin: 0 auto; background: #0f1219; border-radius: 16px; padding: 32px; border: 1px solid rgba(0,255,255,0.1); }
        .logo { font-size: 24px; font-weight: bold; background: linear-gradient(135deg, #00ffff, #0080ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .code { font-size: 48px; font-weight: bold; letter-spacing: 10px; color: #00ffff; text-align: center; margin: 30px 0; background: #0a0a10; padding: 20px; border-radius: 12px; border: 1px solid #00ffff30; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">HCDC-X AI+</div>
        <h3>Your verification code</h3>
        <p>Use the following code to complete your action:</p>
        <div class="code">${code}</div>
        <p>This code will expire in 5 minutes.</p>
        <div class="footer">
          <p>If you didn't request this code, please secure your account immediately.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Verification Code: ${code} - HCDC-X AI+`,
    html,
  });
}

/**
 * Send welcome email with getting started guide
 * @param {string} email - User email
 * @param {string} name - User name
 * @returns {Promise<Object>}
 */
async function sendWelcomeEmail(email, name) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', sans-serif; background: #0b0b0f; color: #eef2ff; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: #0f1219; border-radius: 16px; padding: 32px; border: 1px solid rgba(0,255,255,0.1); }
        .logo { font-size: 28px; font-weight: bold; background: linear-gradient(135deg, #00ffff, #0080ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 16px; }
        .button { display: inline-block; background: linear-gradient(135deg, #00ffff, #0080ff); color: #000; padding: 12px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">HCDC-X AI+</div>
        <h2>Welcome, ${name || 'there'}! 🎉</h2>
        <p>Your HCDC-X AI+ account is ready. Start creating intelligent hybrid codes with multi-layer security.</p>
        <h3>Quick Start:</h3>
        <ul style="list-style: none; padding: 0;">
          <li style="margin: 8px 0;">✅ <strong>Generate codes</strong> — QR, Barcode, Hybrid & Adaptive</li>
          <li style="margin: 8px 0;">✅ <strong>AI-powered scanning</strong> with real-time risk scoring</li>
          <li style="margin: 8px 0;">✅ <strong>Live analytics dashboard</strong></li>
        </ul>
        <a href="${process.env.CLIENT_URL || 'https://hcdcx-ai.netlify.app'}/generator" class="button">Create your first code →</a>
        <p style="margin-top: 24px;">Need help? <a href="mailto:${SUPPORT_EMAIL}" style="color: #00ffff;">Contact support</a></p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Welcome to HCDC-X AI+!',
    html,
  });
}

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendSecurityAlert,
  sendOTPEmail,
  sendWelcomeEmail,
};