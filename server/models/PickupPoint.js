const mongoose = require('mongoose');

const PickupPointSchema = new mongoose.Schema({
  station: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true, index: true },
  platform: { type: mongoose.Schema.Types.ObjectId, ref: 'Platform', required: true, index: true },
  name: { type: String, required: true },
  description: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('PickupPoint', PickupPointSchema);
