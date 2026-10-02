const Review = require('../models/Review');
const Booking = require('../models/Booking');
const PorterProfile = require('../models/PorterProfile');
const { sendNotification } = require('../services/notificationService');

// @desc    Create review
// @route   POST /api/reviews
// @access  Private (Passenger)
exports.createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;
    const passengerId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    if (booking.passenger.toString() !== passengerId) {
      return res.status(403).json({ success: false, message: 'Not authorized to review this booking' });
    }
    
    if (booking.status !== 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Can only rate completed bookings' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ booking: bookingId, reviewer: passengerId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'Review already submitted for this booking' });
    }

    const review = await Review.create({
      booking: bookingId,
      reviewer: passengerId,
      porter: booking.porter,
      rating,
      comment
    });

    // Aggregation pipeline to securely calculate new average and count
    const statsAgg = await Review.aggregate([
      { $match: { porter: booking.porter, isVisible: true } },
      { 
        $group: { 
          _id: '$porter', 
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 } 
        } 
      }
    ]);

    let newAvg = rating;
    let totalCount = 1;

    if (statsAgg.length > 0) {
      newAvg = Math.round(statsAgg[0].avgRating * 10) / 10; // Round to 1 decimal place
      totalCount = statsAgg[0].totalReviews;
    }
    
    await PorterProfile.findOneAndUpdate(
      { user: booking.porter },
      { rating: newAvg, totalReviews: totalCount }
    );

    // Notify Porter
    await sendNotification({
      recipient: booking.porter,
      type: 'INFO',
      title: 'New Review Received',
      message: `You received a ${rating}-star rating for a recent booking.`,
      booking: bookingId
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    if (error.code === 11000) {
       return res.status(400).json({ success: false, message: 'Review already submitted for this booking' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get reviews for a porter
// @route   GET /api/reviews/porter/:porterId
// @access  Public/Private
exports.getPorterReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const query = { porter: req.params.porterId, isVisible: true };

    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .populate('reviewer', 'name profileImage')
      .populate({ path: 'booking', select: 'station platform', populate: { path: 'station platform', select: 'name' } })
      .sort('-createdAt')
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: reviews.length,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      data: reviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get passenger's own reviews
// @route   GET /api/reviews/me
// @access  Private (Passenger)
exports.getPassengerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewer: req.user.id })
      .populate('porter', 'name profileImage')
      .populate({ path: 'booking', select: 'station platform createdAt', populate: { path: 'station platform', select: 'name' } })
      .sort('-createdAt');

    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
