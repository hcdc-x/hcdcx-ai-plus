const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['access', 'refresh', 'verification', 'password_reset'],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index - auto delete
    },
    revoked: {
      type: Boolean,
      default: false,
    },
    revokedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to set expiration based on type
tokenSchema.pre('save', function (next) {
  if (!this.expiresAt) {
    let expiresIn;
    switch (this.type) {
      case 'access':
        expiresIn = 15 * 60; // 15 minutes
        break;
      case 'refresh':
        expiresIn = 7 * 24 * 60 * 60; // 7 days
        break;
      case 'verification':
      case 'password_reset':
        expiresIn = 60 * 60; // 1 hour
        break;
      default:
        expiresIn = 60 * 60;
    }
    this.expiresAt = new Date(Date.now() + expiresIn * 1000);
  }
  next();
});

// Static method to find valid token
tokenSchema.statics.findValidToken = async function (token, type) {
  const tokenDoc = await this.findOne({
    token,
    type,
    revoked: false,
    expiresAt: { $gt: new Date() },
  });
  return tokenDoc;
};

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;
