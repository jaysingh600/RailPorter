const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  passenger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  porter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  platformCommission: {
    type: Number,
    required: true
  },
  porterEarning: {
    type: Number,
    required: true
  },
  fareBreakdown: {
    baseFare: Number,
    luggageCharge: Number,
    serviceCharge: Number,
    total: Number
  },
  method: {
    type: String,
    enum: ['CASH', 'UPI', 'ONLINE'],
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'],
    default: 'PENDING'
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
