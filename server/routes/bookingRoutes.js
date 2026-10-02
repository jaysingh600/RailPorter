const express = require('express');
const rateLimit = require('express-rate-limit');
const { 
  createBooking, 
  getBookingById, 
  updateBookingStatus,
  acceptBooking,
  rejectBooking,
  cancelBooking,
  getPassengerBookings,
  getPorterBookings
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

const bookingLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // Limit to 20 booking actions per 10 min
  message: { success: false, message: 'Too many booking actions. Please try again later.' }
});

router.use(protect);

router.post('/', authorize('passenger'), bookingLimiter, createBooking);

router.get('/passenger', authorize('passenger'), getPassengerBookings);
router.get('/porter', authorize('porter'), getPorterBookings);

router.get('/:id', getBookingById); // Any involved role can view
router.get('/:id/emergencies', require('../controllers/emergencyController').getBookingEmergencies);
router.put('/:id/status', authorize('porter', 'admin'), updateBookingStatus);
router.patch('/:id/location', authorize('porter'), require('../controllers/bookingController').updatePorterLocation);

router.patch('/:id/accept', authorize('porter'), acceptBooking);
router.patch('/:id/reject', authorize('porter'), rejectBooking);
router.patch('/:id/cancel', cancelBooking); // Logic handles both passenger and porter

module.exports = router;
