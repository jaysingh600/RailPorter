const Station = require('../models/Station');
const Platform = require('../models/Platform');
const PickupPoint = require('../models/PickupPoint');

// =======================
// STATIONS
// =======================
exports.createStation = async (req, res) => {
  try {
    const station = await Station.create(req.body);
    res.status(201).json({ success: true, data: station });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateStation = async (req, res) => {
  try {
    const station = await Station.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!station) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: station });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteStation = async (req, res) => {
  try {
    // Soft delete or hard delete based on preference. Let's do hard delete for demo, but normally soft.
    await Station.findByIdAndDelete(req.params.id);
    // Should cascade delete platforms/pickups in real prod
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// =======================
// PLATFORMS
// =======================
exports.createPlatform = async (req, res) => {
  try {
    const platform = await Platform.create(req.body);
    res.status(201).json({ success: true, data: platform });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updatePlatform = async (req, res) => {
  try {
    const platform = await Platform.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!platform) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: platform });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deletePlatform = async (req, res) => {
  try {
    await Platform.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// =======================
// PICKUP POINTS
// =======================
exports.createPickupPoint = async (req, res) => {
  try {
    const pickupPoint = await PickupPoint.create(req.body);
    res.status(201).json({ success: true, data: pickupPoint });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updatePickupPoint = async (req, res) => {
  try {
    const pickupPoint = await PickupPoint.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!pickupPoint) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: pickupPoint });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deletePickupPoint = async (req, res) => {
  try {
    await PickupPoint.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
