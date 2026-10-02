const mongoose = require('mongoose');

const PlatformSchema = new mongoose.Schema({
  station: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true, index: true },
  platformNumber: { type: String, required: true },
  name: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Prevent duplicate platform numbers within the same station
PlatformSchema.index({ station: 1, platformNumber: 1 }, { unique: true });

module.exports = mongoose.model('Platform', PlatformSchema);
