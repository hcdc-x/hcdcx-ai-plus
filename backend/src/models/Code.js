const mongoose = require('mongoose');

const codeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Code name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    type: {
      type: String,
      enum: ['qr', 'barcode', 'hybrid', 'adaptive'],
      required: true,
    },
    data: {
      inputType: {
        type: String,
        enum: ['url', 'text'],
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      url: String,
      text: String,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    colorDepth: {
      type: Number,
      min: 1,
      max: 3,
      default: 2,
    },
    isDynamic: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
    },
    scans: {
      type: Number,
      default: 0,
    },
    metadata: {
      encodingParams: {
        type: Object,
      },
      adaptiveParams: {
        deviceCapability: String,
        lightingCondition: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
codeSchema.index({ userId: 1, createdAt: -1 });
codeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Virtual for checking if code is expired
codeSchema.virtual('isExpired').get(function () {
  return this.expiresAt && new Date() > this.expiresAt;
});

// Pre-save hook for dynamic codes
codeSchema.pre('save', function (next) {
  if (this.isDynamic && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 30 * 1000); // Default 30 seconds
  }
  next();
});

const Code = mongoose.model('Code', codeSchema);

module.exports = Code;
