const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  binanceId: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['transfer_sent', 'transfer_received', 'system'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  transferId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transfer'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isEmailSent: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  readAt: {
    type: Date
  }
});

// Index for faster queries
notificationSchema.index({ userId: 1 });
notificationSchema.index({ binanceId: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);