const PorterProfile = require('../models/PorterProfile');
const User = require('../models/User');
const Booking = require('../models/Booking');
const { calculateDistance } = require('../utils/distance');

// @desc    Get all verified porters with optional filtering
// @route   GET /api/porters
// @access  Private (Passenger)
exports.getPorters = async (req, res) => {
  try {
    const { station, platform, isAvailable, minRating, minExperience, minPrice, maxPrice } = req.query;
    
    // Base query: Only show verified porters
    let query = { verificationStatus: 'VERIFIED' };

    if (station) query.station = station;
    if (platform) query.workingPlatforms = platform; // matches if platform is IN the array
    if (isAvailable !== undefined) {
      query.availabilityStatus = isAvailable === 'true' ? 'AVAILABLE' : { $in: ['OFFLINE', 'BUSY'] };
    }
    if (minRating) query.rating = { $gte: Number(minRating) };
    if (minExperience) query.experience = { $gte: Number(minExperience) };
    
    if (minPrice || maxPrice) {
      query.baseRate = {};
      if (minPrice) query.baseRate.$gte = Number(minPrice);
      if (maxPrice) query.baseRate.$lte = Number(maxPrice);
    }

    const porters = await PorterProfile.find(query)
      .populate({
        path: 'user',
        select: 'name profileImage phone'
      })
      .populate('station', 'name code');

    res.status(200).json({
      success: true,
      count: porters.length,
      data: porters
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single porter profile
// @route   GET /api/porters/:id
// @access  Private (Passenger)
exports.getPorterById = async (req, res) => {
  try {
    const porter = await PorterProfile.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'name profileImage phone'
      })
      .populate('station', 'name code');

    if (!porter) {
      return res.status(404).json({ success: false, message: 'Porter not found' });
    }

    res.status(200).json({
      success: true,
      data: porter
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get available porters (Smart Matching)
// @route   GET /api/porters/available
// @access  Private (Passenger)
exports.getAvailablePorters = async (req, res) => {
  try {
    const { stationId, platformId, pickupLat, pickupLng } = req.query;

    if (!stationId || !platformId) {
      return res.status(400).json({ success: false, message: 'stationId and platformId are required' });
    }

    // 1. Primary Matching Query
    let query = {
      station: stationId,
      workingPlatforms: platformId,
      verificationStatus: 'VERIFIED',
      availabilityStatus: 'AVAILABLE',
      isActive: true
    };

    let matchedPorters = await PorterProfile.find(query)
      .populate({
        path: 'user',
        match: { isActive: true }, // Ensure user account is active
        select: 'name profileImage phone isActive'
      })
      .populate('station', 'name code')
      .populate('workingPlatforms', 'name');

    // Filter out if user match failed (null user)
    matchedPorters = matchedPorters.filter(porter => porter.user && porter.user.isActive);

    // 2. Active Booking Check
    const activeBookingStatuses = ['REQUESTED', 'ACCEPTED', 'REACHED_PLATFORM', 'LUGGAGE_PICKED', 'IN_TRANSIT'];
    const activeBookings = await Booking.find({
      porter: { $in: matchedPorters.map(p => p.user._id) },
      status: { $in: activeBookingStatuses }
    }).select('porter');

    const busyPorterIds = activeBookings.map(b => b.porter.toString());
    
    // 3. Format and Calculate Distance
    let availablePorters = matchedPorters
      .filter(porter => !busyPorterIds.includes(porter.user._id.toString()))
      .map(porter => {
        let approxDist = null;
        if (pickupLat && pickupLng && porter.currentLocation && porter.currentLocation.latitude && porter.currentLocation.longitude) {
          approxDist = calculateDistance(
            Number(pickupLat), 
            Number(pickupLng), 
            porter.currentLocation.latitude, 
            porter.currentLocation.longitude
          );
        }

        return {
          id: porter._id, // Profile ID
          userId: porter.user._id, // User ID (for booking)
          name: porter.user.name,
          profileImage: porter.user.profileImage,
          verified: true,
          rating: porter.rating,
          experience: porter.experience,
          languages: porter.languages,
          station: porter.station,
          workingPlatforms: porter.workingPlatforms,
          availabilityStatus: porter.availabilityStatus,
          approximateDistance: approxDist,
          baseRate: porter.baseRate
        };
      });

    // 4. Smart Ranking
    availablePorters.sort((a, b) => {
      // 1. Same platform - already filtered
      // 2. Currently available - already filtered
      
      // 3. Better proximity
      if (a.approximateDistance !== null && b.approximateDistance !== null) {
        if (a.approximateDistance !== b.approximateDistance) {
          return a.approximateDistance - b.approximateDistance;
        }
      } else if (a.approximateDistance !== null) return -1;
      else if (b.approximateDistance !== null) return 1;

      // 4. Higher rating
      if (b.rating !== a.rating) return b.rating - a.rating;

      // 5. More experience
      return b.experience - a.experience;
    });

    res.status(200).json({
      success: true,
      count: availablePorters.length,
      data: availablePorters
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
