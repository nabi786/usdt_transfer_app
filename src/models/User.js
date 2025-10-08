const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  binanceId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  tronAddress: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  balance: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
userSchema.index({ binanceId: 1 });
userSchema.index({ tronAddress: 1 });
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);






