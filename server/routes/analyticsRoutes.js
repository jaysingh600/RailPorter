const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

// Apply protection to all routes
router.use(protect);

// ----------------------------------------------------------------------------
// Admin Analytics Routes
// ----------------------------------------------------------------------------
router.use('/admin', authorize('admin'));

router.get('/admin/overview', analyticsController.getOverview);
router.get('/admin/bookings', analyticsController.getBookings);
router.get('/admin/revenue', analyticsController.getRevenue);
router.get('/admin/payments', analyticsController.getPayments);
router.get('/admin/stations', analyticsController.getStations);
router.get('/admin/porters', analyticsController.getPorters);
router.get('/admin/porters/:porterId', analyticsController.getPorterDetails);
router.get('/admin/reviews', analyticsController.getReviews);
router.get('/admin/complaints', analyticsController.getComplaints);
router.get('/admin/safety', analyticsController.getSafety);
router.get('/admin/peak-times', analyticsController.getPeakTimes);
router.get('/admin/export/:reportType', analyticsController.exportReport);

// ----------------------------------------------------------------------------
// Porter Analytics Routes
// ----------------------------------------------------------------------------
router.get('/porter/me', authorize('porter'), analyticsController.getPorterPersonalAnalytics);

// ----------------------------------------------------------------------------
// Passenger Analytics Routes
// ----------------------------------------------------------------------------
router.get('/passenger/me', authorize('passenger'), analyticsController.getPassengerPersonalAnalytics);

module.exports = router;
