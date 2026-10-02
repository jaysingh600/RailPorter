const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    index: true
  },
  raisedBy: { // passenger
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  againstUser: { // porter
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Porter behavior', 'Wrong fare', 'Booking issue', 'Luggage issue', 'Payment issue', 'Other']
  },
  subject: {
    type: String,
    required: true,
    maxLength: 100,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxLength: 2000,
    trim: true
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM'
  },
  status: {
    type: String,
    enum: ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED', 'CLOSED'],
    default: 'OPEN',
    index: true
  },
  adminResponse: {
    type: String
  },
  resolution: {
    type: String
  },
  resolvedAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
