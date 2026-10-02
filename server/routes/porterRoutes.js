const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getDashboardStats, getIncomingRequests, updateProfile, updateAvailability } = require('../controllers/porterDashboardController');

router.use(protect);
router.use(authorize('porter'));

router.get('/stats', getDashboardStats);
router.get('/requests', getIncomingRequests);
router.put('/profile', updateProfile);
router.put('/availability', updateAvailability);

// Legacy dashboard route placeholder replaced
// router.get('/dashboard', ...);

module.exports = router;
