const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  passenger: { type: mongoose.Schema.ObjectId, ref: 'User', required: true, index: true },
  porter: { type: mongoose.Schema.ObjectId, ref: 'User', index: true }, // Optional initially
  station: { type: mongoose.Schema.ObjectId, ref: 'Station', index: true },
  platform: { type: mongoose.Schema.ObjectId, ref: 'Platform', required: true, index: true },
  pickupPoint: { type: mongoose.Schema.ObjectId, ref: 'PickupPoint', required: true },
  dropLocation: { type: String },
  
  // Optional Journey details
  trainNumber: { type: String },
  trainName: { type: String },
  coachNumber: { type: String },
  seatNumber: { type: String },
  
  // Luggage Details
  luggageDetails: {
    count: { type: Number, required: true },
    type: { type: String, enum: ['Suitcase', 'Bag', 'Box', 'Other'], required: true },
    instructions: { type: String }
  },
  
  // Fare Breakdown
  fare: {
    baseFare: { type: Number, required: true },
    additionalLuggage: { type: Number, required: true },
    serviceCharge: { type: Number, required: true },
    estimatedTotal: { type: Number, required: true },
    finalTotal: { type: Number }
  },
  
  otp: { type: String },
  status: { 
    type: String, 
    enum: ['REQUESTED', 'ACCEPTED', 'REACHED_PLATFORM', 'LUGGAGE_PICKED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED', 'EXPIRED', 'REJECTED'], 
    default: 'REQUESTED',
    index: true
  },
  paymentStatus: {
    type: String,
    enum: ['UNPAID', 'PAID'],
    default: 'UNPAID'
  },
  
  requestExpiresAt: { type: Date, index: true },
  acceptedAt: { type: Date },
  rejectedAt: { type: Date },
  cancelledAt: { type: Date },
  completedAt: { type: Date },
  cancellationReason: { type: String }
}, { timestamps: true });

// Optimize timeline/sorting queries
BookingSchema.index({ createdAt: -1 });
BookingSchema.index({ status: 1 });

module.exports = mongoose.model('Booking', BookingSchema);
