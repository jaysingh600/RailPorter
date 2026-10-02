const express = require('express');
const { getPorters, getPorterById, getAvailablePorters } = require('../controllers/porterController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('passenger', 'admin'));

router.get('/available', getAvailablePorters);
router.get('/', getPorters);
router.get('/:id', getPorterById);

module.exports = router;
