const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { 
  processPayment, 
  getPaymentDetails, 
  getPassengerPayments, 
  getPorterEarnings, 
  getAllPayments 
} = require('../controllers/paymentController');

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit to 10 payment processing requests per 15 min
  message: { success: false, message: 'Too many payment requests. Please try again later.' }
});

router.use(protect);

router.post('/process', authorize('passenger'), paymentLimiter, processPayment);
router.get('/passenger/history', authorize('passenger'), getPassengerPayments);
router.get('/porter/earnings', authorize('porter'), getPorterEarnings);
router.get('/admin/all', authorize('admin'), getAllPayments);

// Keep dynamic routes at the end to prevent greedy matching
router.get('/:transactionId', getPaymentDetails);

module.exports = router;
