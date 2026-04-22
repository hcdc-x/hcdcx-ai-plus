const ScanLog = require('../models/ScanLog');
const RiskLog = require('../models/RiskLog');
const logger = require('../utils/logger');

// Risk scoring weights
const WEIGHTS = {
  unusual_location: 25,
  rapid_scans: 20,
  suspicious_device: 15,
  ip_blacklisted: 30,
  code_expired: 40,
  invalid_signature: 50,
  multiple_failures: 15,
  off_hours: 10,
  new_device: 10,
};

/**
 * Calculate risk score for a scan
 * @param {Object} context - Scan context
 * @returns {Promise<number>} Risk score 0-100
 */
async function calculateRiskScore(context) {
  const {
    codeId,
    ip,
    deviceInfo,
    userId,
    codeOwnerId,
  } = context;

  let score = 0;
  const triggers = [];

  try {
    // 1. Check for unusual location
    if (ip) {
      const locationRisk = await assessLocationRisk(ip, userId);
      if (locationRisk > 0) {
        score += locationRisk;
        triggers.push('unusual_location');
      }
    }

    // 2. Check for rapid scans (velocity check)
    const velocityRisk = await assessScanVelocity(codeId, ip);
    if (velocityRisk > 0) {
      score += velocityRisk;
      triggers.push('rapid_scans');
    }

    // 3. Check device fingerprint
    if (deviceInfo) {
      const deviceRisk = assessDeviceRisk(deviceInfo, userId);
      if (deviceRisk > 0) {
        score += deviceRisk;
        triggers.push('suspicious_device');
      }
    }

    // 4. Check if IP is suspicious (from recent blocks)
    const ipRisk = await assessIPReputation(ip);
    if (ipRisk > 0) {
      score += ipRisk;
      triggers.push('ip_blacklisted');
    }

    // 5. Check scan time (off-hours might be riskier)
    const hourRisk = assessTimeRisk();
    if (hourRisk > 0) {
      score += hourRisk;
      triggers.push('off_hours');
    }

    // 6. Check if this is a new device for the user
    if (userId) {
      const newDeviceRisk = await assessNewDevice(userId, deviceInfo);
      if (newDeviceRisk > 0) {
        score += newDeviceRisk;
        triggers.push('new_device');
      }
    }

    // Cap score at 100
    score = Math.min(100, Math.round(score));

    // Log risk if score is significant
    if (score >= 40) {
      await RiskLog.create({
        codeId,
        userId,
        score,
        triggers,
        action: score >= 70 ? 'blocked' : 'flagged',
        details: { ip, deviceInfo },
      });
    }

    return score;
  } catch (error) {
    logger.error(`Risk calculation error: ${error.message}`);
    return 50; // Default moderate risk on error
  }
}

/**
 * Assess location-based risk
 */
async function assessLocationRisk(ip, userId) {
  if (!userId) return 0;

  // Get recent scans for this user
  const recentScans = await ScanLog.find({
    userId,
    'location.country': { $exists: true },
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  if (recentScans.length === 0) return 0;

  // Get current location (already fetched in context, but we'd normally fetch here)
  // For simplicity, we'll assume normal if not enough data
  return 0;
}

/**
 * Assess scan velocity (too many scans in short time)
 */
async function assessScanVelocity(codeId, ip) {
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

  const recentScans = await ScanLog.countDocuments({
    $or: [{ codeId }, { ip }],
    createdAt: { $gte: oneMinuteAgo },
  });

  if (recentScans > 10) {
    return WEIGHTS.rapid_scans;
  } else if (recentScans > 5) {
    return WEIGHTS.rapid_scans * 0.5;
  }

  return 0;
}

/**
 * Assess device fingerprint risk
 */
function assessDeviceRisk(deviceInfo, userId) {
  if (!deviceInfo) return 0;

  let risk = 0;

  // Check for emulator/simulator signatures
  const ua = deviceInfo.userAgent || '';
  const suspiciousPatterns = [
    'headless',
    'phantom',
    'selenium',
    'puppeteer',
    'playwright',
  ];

  for (const pattern of suspiciousPatterns) {
    if (ua.toLowerCase().includes(pattern)) {
      risk += WEIGHTS.suspicious_device;
      break;
    }
  }

  return risk;
}

/**
 * Assess IP reputation based on recent blocks
 */
async function assessIPReputation(ip) {
  if (!ip) return 0;

  const recentBlocks = await RiskLog.countDocuments({
    'details.ip': ip,
    action: 'blocked',
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  });

  if (recentBlocks >= 3) {
    return WEIGHTS.ip_blacklisted;
  } else if (recentBlocks >= 1) {
    return WEIGHTS.ip_blacklisted * 0.5;
  }

  return 0;
}

/**
 * Assess time-based risk (scans between 1am-5am are riskier)
 */
function assessTimeRisk() {
  const hour = new Date().getHours();
  if (hour >= 1 && hour <= 5) {
    return WEIGHTS.off_hours;
  }
  return 0;
}

/**
 * Assess if this is a new device for the user
 */
async function assessNewDevice(userId, deviceInfo) {
  if (!userId || !deviceInfo) return 0;

  const existingDevice = await ScanLog.findOne({
    userId,
    'deviceInfo.device': deviceInfo.device,
    'deviceInfo.os': deviceInfo.os,
  });

  if (!existingDevice) {
    return WEIGHTS.new_device;
  }

  return 0;
}

/**
 * Get current security metrics for dashboard
 */
async function getSecurityMetrics(userId) {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [
      totalScans,
      blockedScans,
      suspiciousScans,
      recentAlerts,
    ] = await Promise.all([
      ScanLog.countDocuments({ userId, createdAt: { $gte: startOfDay } }),
      ScanLog.countDocuments({ userId, status: 'blocked', createdAt: { $gte: startOfDay } }),
      ScanLog.countDocuments({ userId, riskScore: { $gte: 40, $lt: 70 }, createdAt: { $gte: startOfDay } }),
      RiskLog.find({ userId, resolved: false })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    // Calculate average risk score
    const riskAgg = await ScanLog.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId), createdAt: { $gte: startOfDay } } },
      { $group: { _id: null, avgRisk: { $avg: '$riskScore' } } },
    ]);

    const overallRiskScore = Math.round(riskAgg[0]?.avgRisk || 0);

    return {
      overallRiskScore,
      totalScans,
      blockedScans,
      suspiciousScans,
      recentAlerts: recentAlerts.map(alert => ({
        id: alert._id,
        type: alert.score >= 70 ? 'high_risk' : 'suspicious',
        message: `Risk score ${alert.score}: ${alert.triggers.join(', ')}`,
        timestamp: alert.createdAt,
      })),
    };
  } catch (error) {
    logger.error(`Failed to get security metrics: ${error.message}`);
    return {
      overallRiskScore: 0,
      totalScans: 0,
      blockedScans: 0,
      suspiciousScans: 0,
      recentAlerts: [],
    };
  }
}

/**
 * Validate OTP token
 */
function validateOTP(token, secret) {
  if (!secret) return false;
  const { authenticator } = require('otplib');
  return authenticator.verify({ token, secret });
}

/**
 * Generate TOTP secret and QR code URI
 */
function generateTOTPSecret(email) {
  const { authenticator } = require('otplib');
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(email, process.env.TOTP_ISSUER || 'HCDCX-AI', secret);
  return { secret, otpauth };
}

module.exports = {
  calculateRiskScore,
  getSecurityMetrics,
  validateOTP,
  generateTOTPSecret,
  WEIGHTS,
};
