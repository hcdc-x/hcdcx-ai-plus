const mongoose = require('mongoose');

const scanLogSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ['success', 'warning', 'blocked'],
      default: 'success',
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    ip: {
      type: String,
    },
    deviceInfo: {
      browser: String,
      os: String,
      device: String,
      userAgent: String,
    },
    location: {
      country: String,
      countryCode: String,
      region: String,
      regionName: String,
      city: String,
      lat: Number,
      lng: Number,
    },
    result: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for analytics queries
scanLogSchema.index({ timestamp: -1 });
scanLogSchema.index({ codeId: 1, createdAt: -1 });
scanLogSchema.index({ riskScore: 1 });
scanLogSchema.index({ 'location.lat': 1, 'location.lng': 1 });

// Virtual for timestamp alias (for compatibility)
scanLogSchema.virtual('timestamp').get(function () {
  return this.createdAt;
});

// Ensure virtuals are included in JSON
scanLogSchema.set('toJSON', { virtuals: true });
scanLogSchema.set('toObject', { virtuals: true });

const ScanLog = mongoose.model('ScanLog', scanLogSchema);

module.exports = ScanLog;
