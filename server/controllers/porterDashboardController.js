const Booking = require('../models/Booking');
const PorterProfile = require('../models/PorterProfile');
const User = require('../models/User');

// @desc    Get dashboard stats (earnings, jobs)
// @route   GET /api/porter/stats
// @access  Private (Porter)
exports.getDashboardStats = async (req, res) => {
  try {
    const porterId = req.user.id;

    // We can do complex aggregations, but for boilerplate we will do basic queries
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completedBookings = await Booking.find({ porter: porterId, status: 'COMPLETED' });
    const todaysBookings = await Booking.find({ porter: porterId, createdAt: { $gte: today } });
    
    // Earnings
    let todayEarnings = 0;
    todaysBookings.forEach(b => {
      if(b.status === 'COMPLETED' && b.fare) {
        todayEarnings += b.fare.estimatedTotal;
      }
    });

    let totalEarnings = 0;
    completedBookings.forEach(b => {
      if(b.fare) totalEarnings += b.fare.estimatedTotal;
    });

    const profile = await PorterProfile.findOne({ user: porterId });

    res.status(200).json({
      success: true,
      data: {
        todaysJobs: todaysBookings.length,
        completedJobs: completedBookings.length,
        todayEarnings,
        totalEarnings,
        rating: profile ? profile.rating : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get incoming requests
// @route   GET /api/porter/requests
// @access  Private (Porter)
exports.getIncomingRequests = async (req, res) => {
  try {
    const requests = await Booking.find({ porter: req.user.id, status: 'REQUESTED' })
      .populate('passenger', 'name phone')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update porter profile
// @route   PUT /api/porter/profile
// @access  Private (Porter)
exports.updateProfile = async (req, res) => {
  try {
    const { languages, experience, baseRate, name, phone } = req.body;

    // Update user details if provided
    if (name || phone) {
      const userUpdates = {};
      if (name) userUpdates.name = name;
      if (phone) userUpdates.phone = phone;
      await User.findByIdAndUpdate(req.user.id, userUpdates, { new: true, runValidators: true });
    }

    // Update profile details
    const profileUpdates = {};
    if (languages) profileUpdates.languages = Array.isArray(languages) ? languages : languages.split(',').map(l => l.trim());
    if (experience !== undefined) profileUpdates.experience = Number(experience);
    if (baseRate !== undefined) profileUpdates.baseRate = Number(baseRate);

    const profile = await PorterProfile.findOneAndUpdate(
      { user: req.user.id },
      profileUpdates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update availability status
// @route   PUT /api/porter/availability
// @access  Private (Porter)
exports.updateAvailability = async (req, res) => {
  try {
    const { availabilityStatus } = req.body;

    if (!['OFFLINE', 'AVAILABLE'].includes(availabilityStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid availability status' });
    }

    const profile = await PorterProfile.findOne({ user: req.user.id });
    
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Porter profile not found' });
    }

    if (profile.verificationStatus !== 'VERIFIED' && availabilityStatus === 'AVAILABLE') {
      return res.status(403).json({ success: false, message: 'Only verified porters can go online' });
    }

    if (profile.availabilityStatus === 'BUSY' && availabilityStatus === 'AVAILABLE') {
       return res.status(403).json({ success: false, message: 'Cannot go available while handling an active job' });
    }

    profile.availabilityStatus = availabilityStatus;
    await profile.save();

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
