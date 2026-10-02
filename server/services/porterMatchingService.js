const PorterProfile = require('../models/PorterProfile');
const Booking = require('../models/Booking');

/**
 * Finds eligible porters for a new booking request.
 * Rules:
 * 1. Verified porter
 * 2. Active porter account
 * 3. AVAILABLE status
 * 4. Same station
 * 5. Working on selected platform
 * 6. No active booking
 */
const findEligiblePorters = async (stationId, platformId) => {
  // 1. Find porters matching basic criteria
  const potentialPorters = await PorterProfile.find({
    station: stationId,
    workingPlatforms: platformId,
    availabilityStatus: 'AVAILABLE',
    verificationStatus: 'VERIFIED',
    isActive: true
  }).populate('user', 'name profileImage email phone');

  if (potentialPorters.length === 0) {
    return [];
  }

  // 2. Filter out porters with active bookings
  const activeStatuses = ['REQUESTED', 'ACCEPTED', 'REACHED_PLATFORM', 'LUGGAGE_PICKED', 'IN_TRANSIT'];
  const eligiblePorters = [];

  for (const porter of potentialPorters) {
    // Check if porter has any active booking
    const activeBooking = await Booking.findOne({
      porter: porter.user._id,
      status: { $in: activeStatuses }
    });

    if (!activeBooking) {
      eligiblePorters.push(porter);
    }
  }

  return eligiblePorters;
};

module.exports = {
  findEligiblePorters
};
