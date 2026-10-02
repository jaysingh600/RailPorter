const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getDashboardData, getBookingHistory, updateProfile } = require('../controllers/passengerDashboardController');

router.use(protect);
router.use(authorize('passenger'));

router.get('/dashboard', getDashboardData);
router.get('/history', getBookingHistory);
router.put('/profile', updateProfile);

module.exports = router;
