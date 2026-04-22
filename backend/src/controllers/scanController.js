const ScanLog = require('../models/ScanLog');
const Code = require('../models/Code');
const RiskLog = require('../models/RiskLog');
const logger = require('../utils/logger');
const { calculateRiskScore } = require('../services/securityService');
const { getGeoLocation } = require('../utils/ipGeolocation');

// @desc    Verify a scanned code
// @route   POST /api/scans/verify
exports.verifyScan = async (req, res, next) => {
  try {
    const { code, deviceInfo } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress;

    // Find the code in database
    const codeDoc = await Code.findOne({
      $or: [
        { 'data.content': code },
        { _id: code },
      ],
    });

    if (!codeDoc) {
      // Log failed scan
      await logScan({
        codeId: null,
        userId: req.user?.id,
        status: 'blocked',
        riskScore: 100,
        ip: clientIp,
        deviceInfo,
        result: 'Code not found',
      });

      return res.status(404).json({
        valid: false,
        riskScore: 100,
        message: 'Invalid code',
      });
    }

    // Check expiration
    if (codeDoc.expiresAt && new Date() > codeDoc.expiresAt) {
      await logScan({
        codeId: codeDoc._id,
        userId: codeDoc.userId,
        status: 'blocked',
        riskScore: 100,
        ip: clientIp,
        deviceInfo,
        result: 'Code expired',
      });

      return res.json({
        valid: false,
        riskScore: 100,
        message: 'Code expired',
      });
    }

    // Calculate risk score
    const riskScore = await calculateRiskScore({
      codeId: codeDoc._id,
      ip: clientIp,
      deviceInfo,
      userId: req.user?.id,
      codeOwnerId: codeDoc.userId,
    });

    // Determine status
    let status = 'success';
    if (riskScore >= 70) status = 'blocked';
    else if (riskScore >= 40) status = 'warning';

    // Log scan
    const location = await getGeoLocation(clientIp);
    await logScan({
      codeId: codeDoc._id,
      userId: req.user?.id,
      status,
      riskScore,
      ip: clientIp,
      deviceInfo,
      location,
    });

    // Update code scan count
    codeDoc.scans += 1;
    await codeDoc.save();

    // If high risk, create risk log
    if (riskScore >= 70) {
      await RiskLog.create({
        codeId: codeDoc._id,
        userId: req.user?.id,
        score: riskScore,
        triggers: ['high_risk_scan'],
        action: 'blocked',
        details: { ip: clientIp, deviceInfo },
      });
    }

    // Emit WebSocket event (handled by socket handler)
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${codeDoc.userId}`).emit('scan:new', {
        _id: new Date().getTime().toString(),
        codeId: codeDoc._id,
        codeName: codeDoc.name,
        deviceInfo,
        location,
        timestamp: new Date().toISOString(),
        riskScore,
        status,
      });
    }

    res.json({
      valid: status !== 'blocked',
      riskScore,
      data: codeDoc.data,
      message: status === 'blocked' ? 'Access blocked due to security risk' : 'Valid code',
    });
  } catch (error) {
    next(error);
  }
};

// Helper to log scan
const logScan = async (data) => {
  try {
    await ScanLog.create(data);
  } catch (err) {
    logger.error(`Failed to log scan: ${err.message}`);
  }
};

// @desc    Get recent scans for user
// @route   GET /api/scans/recent
exports.getRecentScans = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const scans = await ScanLog.find({
      $or: [
        { userId: req.user.id },
        { codeId: { $in: await Code.find({ userId: req.user.id }).distinct('_id') } },
      ],
    })
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('codeId', 'name')
      .lean();

    const formatted = scans.map((scan) => ({
      _id: scan._id,
      codeId: scan.codeId?._id || scan.codeId,
      codeName: scan.codeId?.name || 'Unknown',
      deviceInfo: scan.deviceInfo,
      location: scan.location,
      timestamp: scan.timestamp,
      riskScore: scan.riskScore,
      status: scan.status,
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

// @desc    Get scan statistics
// @route   GET /api/scans/stats
exports.getScanStats = async (req, res, next) => {
  try {
    const range = req.query.range || 'week';
    let startDate = new Date();

    switch (range) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(startDate.getDate() - 30);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    const userCodes = await Code.find({ userId: req.user.id }).distinct('_id');

    const matchStage = {
      $match: {
        timestamp: { $gte: startDate },
        $or: [
          { userId: req.user.id },
          { codeId: { $in: userCodes } },
        ],
      },
    };

    // Total scans
    const totalScans = await ScanLog.countDocuments(matchStage.$match);

    // Scans by day
    const scansByDay = await ScanLog.aggregate([
      matchStage,
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          scans: { $sum: 1 },
          riskScans: {
            $sum: { $cond: [{ $gte: ['$riskScore', 40] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Device distribution
    const deviceDistribution = await ScanLog.aggregate([
      matchStage,
      {
        $group: {
          _id: '$deviceInfo.device',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Geo data for heatmap
    const geoData = await ScanLog.aggregate([
      matchStage,
      { $match: { 'location.lat': { $exists: true } } },
      {
        $group: {
          _id: { lat: '$location.lat', lng: '$location.lng' },
          count: { $sum: 1 },
          location: { $first: '$location.city' },
        },
      },
      {
        $project: {
          lat: '$_id.lat',
          lng: '$_id.lng',
          weight: { $divide: ['$count', 10] }, // Normalize weight
          location: 1,
          _id: 0,
        },
      },
    ]);

    // Risk distribution
    const riskDistribution = await ScanLog.aggregate([
      matchStage,
      {
        $bucket: {
          groupBy: '$riskScore',
          boundaries: [0, 20, 40, 60, 80, 100],
          default: 'Other',
          output: { count: { $sum: 1 } },
        },
      },
    ]);

    res.json({
      totalScans,
      scansByDay: scansByDay.map(d => ({
        date: d._id,
        scans: d.scans,
        riskScans: d.riskScans,
      })),
      deviceDistribution: deviceDistribution.map(d => ({
        device: d._id || 'Unknown',
        count: d.count,
      })),
      geoData,
      riskDistribution,
    });
  } catch (error) {
    next(error);
  }
};
