const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { 
  createReview, 
  getPorterReviews, 
  getPassengerReviews 
} = require('../controllers/reviewController');

// Public route to get reviews for a specific porter
router.get('/porter/:porterId', getPorterReviews);

router.use(protect);
router.post('/', authorize('passenger'), createReview);
router.get('/me', authorize('passenger'), getPassengerReviews);

module.exports = router;
