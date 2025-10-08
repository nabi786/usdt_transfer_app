const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
  fromBinanceId: {
    type: String,
    required: true,
    trim: true
  },
  toBinanceId: {
    type: String,
    required: true,
    trim: true
  },
  fromTronAddress: {
    type: String,
    required: true,
    trim: true
  },
  toTronAddress: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  transactionHash: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  notificationSent: {
    sender: {
      type: Boolean,
      default: false
    },
    receiver: {
      type: Boolean,
      default: false
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  errorMessage: {
    type: String,
    trim: true
  }
});

// Index for faster queries
transferSchema.index({ fromBinanceId: 1 });
transferSchema.index({ toBinanceId: 1 });
transferSchema.index({ transactionHash: 1 });
transferSchema.index({ status: 1 });
transferSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Transfer', transferSchema);






