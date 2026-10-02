const mongoose = require('mongoose');

const emergencyEventSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    index: true
  },
  triggeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  triggeredByRole: {
    type: String,
    enum: ['passenger', 'porter'],
    required: true
  },
  type: {
    type: String,
    enum: ['SOS', 'SAFETY_INCIDENT'],
    required: true
  },
  category: {
    type: String,
    enum: ['MEDICAL', 'THREAT', 'HARASSMENT', 'ACCIDENT', 'LUGGAGE_ISSUE', 'PORTER_BEHAVIOUR', 'PASSENGER_BEHAVIOUR', 'OTHER'],
    required: true
  },
  description: {
    type: String
  },
  location: {
    latitude: Number,
    longitude: Number,
    accuracy: Number,
    updatedAt: Date
  },
  status: {
    type: String,
    enum: ['OPEN', 'ACKNOWLEDGED', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED'],
    default: 'OPEN',
    index: true
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM'
  },
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  acknowledgedAt: {
    type: Date
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  },
  resolution: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('EmergencyEvent', emergencyEventSchema);
