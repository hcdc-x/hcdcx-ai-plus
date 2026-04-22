const ScanLog = require('../models/ScanLog');
const Code = require('../models/Code');
const User = require('../models/User');

// @desc    Get dashboard analytics summary
// @route   GET /api/analytics
exports.getAnalytics = async (req, res, next) => {
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

    // Summary stats
    const totalScans = await ScanLog.countDocuments(matchStage.$match);
    const blockedScans = await ScanLog.countDocuments({
      ...matchStage.$match,
      status: 'blocked',
    });

    // Risk score average
    const riskAgg = await ScanLog.aggregate([
      matchStage,
      {
        $group: {
          _id: null,
          avgRisk: { $avg: '$riskScore' },
        },
      },
    ]);

    // Top codes
    const topCodes = await ScanLog.aggregate([
      matchStage,
      {
        $group: {
          _id: '$codeId',
          scans: { $sum: 1 },
        },
      },
      { $sort: { scans: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'codes',
          localField: '_id',
          foreignField: '_id',
          as: 'code',
        },
      },
      { $unwind: '$code' },
      {
        $project: {
          id: '$_id',
          name: '$code.name',
          scans: 1,
          _id: 0,
        },
      },
    ]);

    // Hourly scan distribution
    const hourlyScans = await ScanLog.aggregate([
      matchStage,
      {
        $group: {
          _id: { $hour: '$timestamp' },
          scans: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      summary: {
        totalScans,
        blockedScans,
        avgRiskScore: riskAgg[0]?.avgRisk || 0,
        activeCodes: userCodes.length,
      },
      topCodes,
      hourlyScans,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin analytics (all users)
// @route   GET /api/analytics/admin
exports.getAdminAnalytics = async (req, res, next) => {
  try {
    // Only admin role can access
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const totalUsers = await User.countDocuments();
    const totalCodes = await Code.countDocuments();
    const totalScans = await ScanLog.countDocuments();

    const recentScans = await ScanLog.find()
      .sort({ timestamp: -1 })
      .limit(100)
      .lean();

    res.json({
      totals: {
        users: totalUsers,
        codes: totalCodes,
        scans: totalScans,
      },
      recentScans,
    });
  } catch (error) {
    next(error);
  }
};
