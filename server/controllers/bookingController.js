const Booking = require('../models/Booking');
const PorterProfile = require('../models/PorterProfile');
const { calculateFare } = require('../services/fareService');
const { findEligiblePorters } = require('../services/porterMatchingService');
const { getIo } = require('../socket');
const { sendNotification } = require('../services/notificationService');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (Passenger)
exports.createBooking = async (req, res) => {
  try {
    const { 
      station, 
      platform, 
      pickupPoint, 
      dropLocation,
      trainNumber,
      trainName,
      coachNumber,
      seatNumber,
      luggageDetails
    } = req.body;

    if (!station || !platform || !pickupPoint || !dropLocation || !luggageDetails) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // 1. Prevent multiple active requests from passenger
    const activePassengerBookings = await Booking.findOne({
      passenger: req.user.id,
      status: { $in: ['REQUESTED', 'ACCEPTED', 'REACHED_PLATFORM', 'LUGGAGE_PICKED', 'IN_TRANSIT'] }
    });

    if (activePassengerBookings) {
      return res.status(409).json({ success: false, message: 'You already have an active porter booking.' });
    }

    // 2. Find eligible porters
    const eligiblePorters = await findEligiblePorters(station, platform);
    
    if (eligiblePorters.length === 0) {
      return res.status(404).json({ success: false, message: 'No porter is currently available on this platform' });
    }

    // 3. Calculate Fare (using first porter's base rate as an estimate for now)
    const fare = calculateFare(eligiblePorters[0].baseRate, luggageDetails.count);

    // 4. Create Booking
    const requestExpiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now
    const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP

    const booking = await Booking.create({
      passenger: req.user.id,
      station,
      platform,
      pickupPoint,
      dropLocation,
      trainNumber,
      trainName,
      coachNumber,
      seatNumber,
      luggageDetails,
      fare,
      otp,
      status: 'REQUESTED',
      requestExpiresAt
    });

    // Populate necessary fields for broadcasting
    const populatedBooking = await Booking.findById(booking._id)
      .populate('station', 'name')
      .populate('platform', 'name')
      .populate('pickupPoint', 'name')
      .populate('passenger', 'name email phone');

    // 5. Send real-time booking request to eligible porters using Socket.IO
    const io = getIo();
    for (const porter of eligiblePorters) {
      io.to(`porter:${porter.user._id.toString()}`).emit('booking:new-request', populatedBooking);
      
      await sendNotification({
        recipient: porter.user._id,
        type: 'PORTER_REQUEST',
        title: 'New Porter Request',
        message: `New request at ${station.name}, Platform ${platform.name}.`,
        booking: booking._id
      });
    }

    res.status(201).json({
      success: true,
      message: 'Porter request created successfully',
      data: populatedBooking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Accept a booking
// @route   PATCH /api/bookings/:id/accept
// @access  Private (Porter)
exports.acceptBooking = async (req, res) => {
  try {
    const porterId = req.user.id;
    const bookingId = req.params.id;

    // 1. Verify porter is verified and not already busy
    const porterProfile = await PorterProfile.findOne({ user: porterId });
    if (!porterProfile || porterProfile.verificationStatus !== 'VERIFIED') {
      return res.status(403).json({ success: false, message: 'Not authorized or not verified' });
    }
    
    if (porterProfile.availabilityStatus !== 'AVAILABLE') {
      return res.status(409).json({ success: false, message: 'You are currently not available or already busy' });
    }

    // Check if they already have an active booking
    const activeBooking = await Booking.findOne({
      porter: porterId,
      status: { $in: ['REQUESTED', 'ACCEPTED', 'REACHED_PLATFORM', 'LUGGAGE_PICKED', 'IN_TRANSIT'] }
    });
    if (activeBooking) {
      return res.status(409).json({ success: false, message: 'You already have an active booking' });
    }

    // 2. Atomic assignment: find REQUESTED booking and assign it
    const booking = await Booking.findOneAndUpdate(
      { _id: bookingId, status: 'REQUESTED' },
      { 
        $set: { 
          porter: porterId, 
          status: 'ACCEPTED', 
          acceptedAt: new Date() 
        } 
      },
      { new: true }
    )
    .populate('passenger', 'name email phone')
    .populate('porter', 'name email phone profileImage')
    .populate('station', 'name')
    .populate('platform', 'name')
    .populate('pickupPoint', 'name');

    if (!booking) {
      return res.status(409).json({ success: false, message: 'Booking is already accepted or unavailable.' });
    }

    // 3. Atomically change porter state to BUSY
    await PorterProfile.findOneAndUpdate(
      { user: porterId, availabilityStatus: 'AVAILABLE' },
      { $set: { availabilityStatus: 'BUSY' } }
    );

    // 4. Emit to passenger
    const io = getIo();
    io.to(`passenger:${booking.passenger._id.toString()}`).emit('booking:accepted', booking);
    
    // Also emit globally to the booking room to update state
    io.to(`booking:${booking._id}`).emit('booking:status-updated', { status: 'ACCEPTED', booking });

    await sendNotification({
      recipient: booking.passenger._id,
      type: 'PORTER_ACCEPTED',
      title: 'Porter Found',
      message: `${booking.porter.name} has accepted your booking and is on the way.`,
      booking: booking._id
    });

    res.status(200).json({
      success: true,
      message: 'Booking accepted successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject a booking request
// @route   PATCH /api/bookings/:id/reject
// @access  Private (Porter)
exports.rejectBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    // Just tell the socket to not show it to this porter anymore, 
    // or log the rejection locally. We don't cancel the booking because others might accept.
    // Can track rejections in a separate array in Booking if needed, but not required strictly.
    
    res.status(200).json({
      success: true,
      message: 'Request rejected'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel a booking
// @route   PATCH /api/bookings/:id/cancel
// @access  Private (Passenger/Porter)
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Auth check
    if (booking.passenger.toString() !== req.user.id && (!booking.porter || booking.porter.toString() !== req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (['COMPLETED', 'CANCELLED', 'EXPIRED'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Booking cannot be cancelled in its current state' });
    }

    const previousStatus = booking.status;
    booking.status = 'CANCELLED';
    booking.cancelledAt = new Date();
    booking.cancellationReason = req.body.reason || 'Cancelled by user';
    await booking.save();

    // If a porter was assigned, free them up
    if (booking.porter && previousStatus !== 'REQUESTED') {
      await PorterProfile.findOneAndUpdate(
        { user: booking.porter },
        { $set: { availabilityStatus: 'AVAILABLE' } }
      );
    }

    const io = getIo();
    if (previousStatus === 'REQUESTED') {
      io.emit('booking:request-cancelled', { bookingId: booking._id });
    } else {
      io.to(`booking:${booking._id}`).emit('booking:cancelled', booking);
      
      // Notify the other party
      const notifyUserId = req.user.id === booking.passenger.toString() ? booking.porter : booking.passenger;
      if (notifyUserId) {
        await sendNotification({
          recipient: notifyUserId,
          type: 'BOOKING_CANCELLED',
          title: 'Booking Cancelled',
          message: `The booking was cancelled. Reason: ${booking.cancellationReason}`,
          booking: booking._id
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('passenger', 'name email phone')
      .populate('porter', 'name email phone profileImage')
      .populate('station', 'name')
      .populate('platform', 'name')
      .populate('pickupPoint', 'name');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.passenger._id.toString() !== req.user.id && (!booking.porter || booking.porter._id.toString() !== req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to access this booking' });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get passenger bookings
// @route   GET /api/bookings/passenger
// @access  Private (Passenger)
exports.getPassengerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ passenger: req.user.id })
      .populate('porter', 'name email phone profileImage')
      .populate('station', 'name')
      .populate('platform', 'name')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get porter bookings
// @route   GET /api/bookings/porter
// @access  Private (Porter)
exports.getPorterBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ porter: req.user.id })
      .populate('passenger', 'name email phone')
      .populate('station', 'name')
      .populate('platform', 'name')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Porter)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, otp } = req.body;
    
    const validStatuses = ['REACHED_PLATFORM', 'LUGGAGE_PICKED', 'IN_TRANSIT', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status transition' });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (!booking.porter || booking.porter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this booking' });
    }

    if (status === 'LUGGAGE_PICKED') {
      if (!otp || booking.otp !== otp) {
        return res.status(400).json({ success: false, message: 'Invalid or missing OTP. Please ask the passenger for the 4-digit PIN.' });
      }
    }

    booking.status = status;
    if (status === 'COMPLETED') {
      booking.completedAt = new Date();
      booking.fare.finalTotal = booking.fare.estimatedTotal; // Lock final fare on backend
      // Free up porter
      await PorterProfile.findOneAndUpdate(
        { user: booking.porter },
        { $set: { availabilityStatus: 'AVAILABLE' }, $inc: { totalCompletedBookings: 1 } }
      );
    }
    
    await booking.save();

    let title = 'Booking Update';
    let message = `Your booking status is now ${status.replace('_', ' ')}`;
    let type = 'INFO';
    
    if (status === 'REACHED_PLATFORM') { title = 'Porter Reached'; message = 'Your porter has arrived at the platform.'; type = 'PORTER_REACHED'; }
    if (status === 'LUGGAGE_PICKED') { title = 'Luggage Picked Up'; message = 'Your luggage has been securely picked up.'; type = 'LUGGAGE_PICKED'; }
    if (status === 'COMPLETED') { title = 'Booking Completed'; message = 'Your job is complete. Please rate your porter!'; type = 'SERVICE_COMPLETED'; }
    
    await sendNotification({
      recipient: booking.passenger,
      title,
      message,
      type,
      booking: booking._id
    });

    const io = getIo();
    io.to(`booking:${booking._id}`).emit('booking:status-updated', { status, bookingId: booking._id, booking });
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update porter location (REST Fallback)
// @route   PATCH /api/bookings/:id/location
// @access  Private (Porter)
exports.updatePorterLocation = async (req, res) => {
  try {
    const { latitude, longitude, accuracy } = req.body;
    
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ success: false, message: 'Invalid coordinates' });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (!booking.porter || booking.porter.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const activeStatuses = ['ACCEPTED', 'REACHED_PLATFORM', 'LUGGAGE_PICKED', 'IN_TRANSIT'];
    if (!activeStatuses.includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Booking is not active' });
    }

    const locationData = {
      latitude,
      longitude,
      accuracy,
      updatedAt: new Date()
    };

    await PorterProfile.findOneAndUpdate(
      { user: req.user.id },
      { $set: { currentLocation: locationData } }
    );

    const io = getIo();
    io.to(`booking:${booking._id}`).emit('porter_location_changed', {
      ...locationData,
      timestamp: locationData.updatedAt
    });

    res.status(200).json({
      success: true,
      message: 'Location updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
