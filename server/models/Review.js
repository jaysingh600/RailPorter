const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.ObjectId, ref: 'Booking', required: true },
  reviewer: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  porter: { type: mongoose.Schema.ObjectId, ref: 'User', required: true, index: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, maxLength: 500, trim: true },
  isVisible: { type: Boolean, default: true },
  adminResponse: { type: String }
}, { timestamps: true });

// Ensure a passenger can only leave one review per booking
ReviewSchema.index({ booking: 1, reviewer: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
