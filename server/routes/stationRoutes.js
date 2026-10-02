const express = require('express');
const { getStations, getStation, getPlatforms, getPickupPoints } = require('../controllers/stationController');

const router = express.Router();

// Base path: /api/stations
router.get('/', getStations);
router.get('/:id', getStation);
router.get('/:id/platforms', getPlatforms);

// Base path for platforms to pickup points might be better placed here or separately, 
// but we'll mount it in server.js under /api/platforms
module.exports = router;
