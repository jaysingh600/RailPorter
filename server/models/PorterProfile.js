const mongoose = require('mongoose');

const PorterProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  station: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true, index: true },
  workingPlatforms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Platform', index: true }],
  availabilityStatus: { 
    type: String, 
    enum: ['OFFLINE', 'AVAILABLE', 'BUSY'], 
    default: 'OFFLINE',
    index: true 
  },
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  experience: { type: Number, required: true },
  languages: { type: [String], required: true },
  baseRate: { type: Number, default: 100 },
  totalCompletedBookings: { type: Number, default: 0 },
  verificationStatus: { 
    type: String, 
    enum: ['PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'], 
    default: 'PENDING',
    index: true 
  },
  verificationReason: { type: String },
  rejectedAt: { type: Date },
  rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  suspensionReason: { type: String },
  suspendedAt: { type: Date },
  suspendedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  currentLocation: {
    latitude: { type: Number },
    longitude: { type: Number },
    accuracy: { type: Number },
    updatedAt: { type: Date }
  }
}, { timestamps: true });

module.exports = mongoose.model('PorterProfile', PorterProfileSchema);
