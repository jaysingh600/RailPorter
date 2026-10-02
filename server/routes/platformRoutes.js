const express = require('express');
const { getPickupPoints } = require('../controllers/stationController');

const router = express.Router();

router.get('/:id/pickup-points', getPickupPoints);

module.exports = router;
