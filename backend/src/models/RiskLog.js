const mongoose = require('mongoose');

const riskLogSchema = new mongoose.Schema(
  {
    codeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Code',
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    triggers: [
      {
        type: String,
        enum: [
          'unusual_location',
          'rapid_scans',
          'suspicious_device',
          'ip_blacklisted',
          'code_expired',
          'invalid_signature',
          'high_risk_scan',
          'multiple_failures',
        ],
      },
    ],
    action: {
      type: String,
      enum: ['allowed', 'limited', 'blocked', 'flagged'],
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
    resolved: {
      type: Boolean,
      default: false,
    },
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
riskLogSchema.index({ createdAt: -1 });
riskLogSchema.index({ score: 1 });
riskLogSchema.index({ resolved: 1 });

// Static method to get unresolved high-risk logs
riskLogSchema.statics.getUnresolvedHighRisk = async function (threshold = 70) {
  return this.find({
    score: { $gte: threshold },
    resolved: false,
  }).sort({ createdAt: -1 });
};

// Method to resolve risk log
riskLogSchema.methods.resolve = async function (userId) {
  this.resolved = true;
  this.resolvedAt = new Date();
  this.resolvedBy = userId;
  return this.save();
};

const RiskLog = mongoose.model('RiskLog', riskLogSchema);

module.exports = RiskLog;
