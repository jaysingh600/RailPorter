const Station = require('../models/Station');
const Platform = require('../models/Platform');
const PickupPoint = require('../models/PickupPoint');

// @desc    Get all active stations
// @route   GET /api/stations
// @access  Public
exports.getStations = async (req, res) => {
  try {
    const stations = await Station.find({ isActive: true }).sort('name');
    res.status(200).json({ success: true, count: stations.length, data: stations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single station
// @route   GET /api/stations/:id
// @access  Public
exports.getStation = async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);
    if (!station) return res.status(404).json({ success: false, message: 'Station not found' });
    res.status(200).json({ success: true, data: station });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get platforms for a station
// @route   GET /api/stations/:id/platforms
// @access  Public
exports.getPlatforms = async (req, res) => {
  try {
    const platforms = await Platform.find({ station: req.params.id, isActive: true }).sort('platformNumber');
    res.status(200).json({ success: true, count: platforms.length, data: platforms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get pickup points for a platform
// @route   GET /api/platforms/:id/pickup-points
// @access  Public
exports.getPickupPoints = async (req, res) => {
  try {
    const pickupPoints = await PickupPoint.find({ platform: req.params.id, isActive: true }).sort('name');
    res.status(200).json({ success: true, count: pickupPoints.length, data: pickupPoints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
