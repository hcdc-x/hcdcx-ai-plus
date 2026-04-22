const ScanLog = require('../models/ScanLog');
const Code = require('../models/Code');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Generate comprehensive analytics report
 */
async function generateReport(userId, options = {}) {
  const {
    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate = new Date(),
    groupBy = 'day',
  } = options;

  try {
    const matchStage = {
      $match: {
        userId: userId ? mongoose.Types.ObjectId(userId) : { $exists: true },
        createdAt: { $gte: startDate, $lte: endDate },
      },
    };

    const [
      overview,
      timeSeries,
      geoDistribution,
      deviceStats,
      riskAnalysis,
      topCodes,
    ] = await Promise.all([
      getOverview(matchStage),
      getTimeSeries(matchStage, groupBy),
      getGeoDistribution(matchStage),
      getDeviceStats(matchStage),
      getRiskAnalysis(matchStage),
      getTopCodes(matchStage),
    ]);

    return {
      overview,
      timeSeries,
      geoDistribution,
      deviceStats,
      riskAnalysis,
      topCodes,
      period: { startDate, endDate },
      generatedAt: new Date(),
    };
  } catch (error) {
    logger.error(`Report generation failed: ${error.message}`);
    throw error;
  }
}

/**
 * Get overview statistics
 */
async function getOverview(matchStage) {
  const pipeline = [
    matchStage,
    {
      $group: {
        _id: null,
        totalScans: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' },
        uniqueCodes: { $addToSet: '$codeId' },
        avgRiskScore: { $avg: '$riskScore' },
        blockedScans: {
          $sum: { $cond: [{ $eq: ['$status', 'blocked'] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalScans: 1,
        uniqueUsers: { $size: '$uniqueUsers' },
        uniqueCodes: { $size: '$uniqueCodes' },
        avgRiskScore: { $round: ['$avgRiskScore', 2] },
        blockedScans: 1,
        successRate: {
          $round: [
            {
              $multiply: [
                { $divide: [{ $subtract: ['$totalScans', '$blockedScans'] }, '$totalScans'] },
                100,
              ],
            },
            2,
          ],
        },
      },
    },
  ];

  const result = await ScanLog.aggregate(pipeline);
  return result[0] || {
    totalScans: 0,
    uniqueUsers: 0,
    uniqueCodes: 0,
    avgRiskScore: 0,
    blockedScans: 0,
    successRate: 0,
  };
}

/**
 * Get time series data
 */
async function getTimeSeries(matchStage, groupBy = 'day') {
  let dateFormat;
  switch (groupBy) {
    case 'hour':
      dateFormat = '%Y-%m-%d %H:00';
      break;
    case 'day':
      dateFormat = '%Y-%m-%d';
      break;
    case 'week':
      dateFormat = '%Y-%U';
      break;
    case 'month':
      dateFormat = '%Y-%m';
      break;
    default:
      dateFormat = '%Y-%m-%d';
  }

  const pipeline = [
    matchStage,
    {
      $group: {
        _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
        scans: { $sum: 1 },
        avgRisk: { $avg: '$riskScore' },
        blocked: {
          $sum: { $cond: [{ $eq: ['$status', 'blocked'] }, 1, 0] },
        },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        date: '$_id',
        scans: 1,
        avgRisk: { $round: ['$avgRisk', 2] },
        blocked: 1,
        _id: 0,
      },
    },
  ];

  return ScanLog.aggregate(pipeline);
}

/**
 * Get geographic distribution
 */
async function getGeoDistribution(matchStage) {
  const pipeline = [
    {
      $match: {
        ...matchStage.$match,
        'location.lat': { $exists: true },
        'location.lng': { $exists: true },
      },
    },
    {
      $group: {
        _id: {
          country: '$location.country',
          city: '$location.city',
          lat: '$location.lat',
          lng: '$location.lng',
        },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        country: '$_id.country',
        city: '$_id.city',
        lat: '$_id.lat',
        lng: '$_id.lng',
        count: 1,
        _id: 0,
      },
    },
    { $sort: { count: -1 } },
  ];

  return ScanLog.aggregate(pipeline);
}

/**
 * Get device statistics
 */
async function getDeviceStats(matchStage) {
  const pipeline = [
    matchStage,
    {
      $group: {
        _id: {
          device: '$deviceInfo.device',
          os: '$deviceInfo.os',
          browser: '$deviceInfo.browser',
        },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        device: '$_id.device',
        os: '$_id.os',
        browser: '$_id.browser',
        count: 1,
        _id: 0,
      },
    },
    { $sort: { count: -1 } },
    { $limit: 20 },
  ];

  return ScanLog.aggregate(pipeline);
}

/**
 * Get risk analysis data
 */
async function getRiskAnalysis(matchStage) {
  const pipeline = [
    matchStage,
    {
      $bucket: {
        groupBy: '$riskScore',
        boundaries: [0, 20, 40, 60, 80, 101],
        default: '100+',
        output: {
          count: { $sum: 1 },
          avgScore: { $avg: '$riskScore' },
        },
      },
    },
    {
      $project: {
        range: {
          $switch: {
            branches: [
              { case: { $eq: ['$_id', 0] }, then: '0-19' },
              { case: { $eq: ['$_id', 20] }, then: '20-39' },
              { case: { $eq: ['$_id', 40] }, then: '40-59' },
              { case: { $eq: ['$_id', 60] }, then: '60-79' },
              { case: { $eq: ['$_id', 80] }, then: '80-100' },
            ],
            default: '100+',
          },
        },
        count: 1,
        avgScore: { $round: ['$avgScore', 2] },
        _id: 0,
      },
    },
    { $sort: { range: 1 } },
  ];

  return ScanLog.aggregate(pipeline);
}

/**
 * Get top performing codes
 */
async function getTopCodes(matchStage) {
  const pipeline = [
    { $match: { ...matchStage.$match, codeId: { $ne: null } } },
    {
      $group: {
        _id: '$codeId',
        scans: { $sum: 1 },
        avgRisk: { $avg: '$riskScore' },
      },
    },
    { $sort: { scans: -1 } },
    { $limit: 10 },
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
        type: '$code.type',
        scans: 1,
        avgRisk: { $round: ['$avgRisk', 2] },
        _id: 0,
      },
    },
  ];

  return ScanLog.aggregate(pipeline);
}

/**
 * Get real-time scan feed data
 */
async function getScanFeed(limit = 20) {
  return ScanLog.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('codeId', 'name')
    .populate('userId', 'name email')
    .lean();
}

/**
 * Calculate growth metrics
 */
async function getGrowthMetrics(userId) {
  const now = new Date();
  const periods = [
    { name: 'today', start: new Date(now.setHours(0, 0, 0, 0)) },
    { name: 'yesterday', start: new Date(now.setDate(now.getDate() - 1)), end: new Date(now.setHours(23, 59, 59, 999)) },
    { name: 'thisWeek', start: new Date(now.setDate(now.getDate() - 7)) },
    { name: 'lastWeek', start: new Date(now.setDate(now.getDate() - 14)), end: new Date(now.setDate(now.getDate() + 7)) },
  ];

  const metrics = {};

  for (const period of periods) {
    const query = { createdAt: { $gte: period.start } };
    if (period.end) query.createdAt.$lte = period.end;
    if (userId) query.userId = userId;

    metrics[period.name] = await ScanLog.countDocuments(query);
  }

  // Calculate growth percentages
  metrics.growth = {
    daily: metrics.yesterday ? ((metrics.today - metrics.yesterday) / metrics.yesterday * 100).toFixed(2) : 0,
    weekly: metrics.lastWeek ? ((metrics.thisWeek - metrics.lastWeek) / metrics.lastWeek * 100).toFixed(2) : 0,
  };

  return metrics;
}

// Import mongoose for ObjectId
const mongoose = require('mongoose');

module.exports = {
  generateReport,
  getOverview,
  getTimeSeries,
  getGeoDistribution,
  getDeviceStats,
  getRiskAnalysis,
  getTopCodes,
  getScanFeed,
  getGrowthMetrics,
};
