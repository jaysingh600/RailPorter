const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'BOOKING_CREATED',
      'PORTER_REQUEST',
      'PORTER_ACCEPTED',
      'PORTER_REJECTED',
      'PORTER_FOUND',
      'PORTER_REACHED',
      'LUGGAGE_PICKED',
      'SERVICE_STARTED',
      'SERVICE_COMPLETED',
      'BOOKING_CANCELLED',
      'BOOKING_EXPIRED',
      'PAYMENT_CREATED',
      'PAYMENT_SUCCESS',
      'PAYMENT_FAILED',
      'PAYMENT_REFUNDED',
      'SYSTEM'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  }
}, { timestamps: true });

// Compound index for querying user notifications quickly, particularly for unread badge counts
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
