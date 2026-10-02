const Booking = require('../models/Booking');
const User = require('../models/User');

// @desc    Get dashboard home data (active + recent bookings)
// @route   GET /api/passenger/dashboard
// @access  Private (Passenger)
exports.getDashboardData = async (req, res) => {
  try {
    const passengerId = req.user.id;

    // Find active booking
    const activeStatuses = ['REQUESTED', 'ACCEPTED', 'REACHED_PLATFORM', 'LUGGAGE_PICKED', 'IN_TRANSIT'];
    const activeBooking = await Booking.findOne({ 
      passenger: passengerId, 
      status: { $in: activeStatuses } 
    }).populate('porter', 'name phone profileImage');

    // Find recent 3 bookings
    const recentBookings = await Booking.find({ passenger: passengerId })
      .sort('-createdAt')
      .limit(3)
      .populate('porter', 'name');

    res.status(200).json({
      success: true,
      data: {
        activeBooking,
        recentBookings
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get complete booking history
// @route   GET /api/passenger/history
// @access  Private (Passenger)
exports.getBookingHistory = async (req, res) => {
  try {
    const history = await Booking.find({ passenger: req.user.id })
      .populate('porter', 'name')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update passenger profile
// @route   PUT /api/passenger/profile
// @access  Private (Passenger)
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, email } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (email) updates.email = email;

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
