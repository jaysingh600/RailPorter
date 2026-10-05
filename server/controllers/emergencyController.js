const EmergencyEvent = require('../models/EmergencyEvent');
const Booking = require('../models/Booking');
const { sendNotification } = require('../services/notificationService');
const { getIo } = require('../socket');

const activeStatuses = ['ACCEPTED', 'REACHED_PLATFORM', 'LUGGAGE_PICKED', 'IN_TRANSIT'];

// @desc    Trigger SOS
// @route   POST /api/emergency/sos
// @access  Private
exports.triggerSOS = async (req, res) => {
  try {
    const { bookingId, location } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Validate ownership
    const isPassenger = booking.passenger.toString() === req.user.id;
    const isPorter = booking.porter?.toString() === req.user.id;
    if (!isPassenger && !isPorter) {
      return res.status(403).json({ success: false, message: 'Not authorized for this booking' });
    }

    if (!activeStatuses.includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'SOS can only be triggered during an active booking' });
    }

    // Check for cooldown / existing open SOS for this booking by this user
    const existingSOS = await EmergencyEvent.findOne({
      booking: bookingId,
      triggeredBy: req.user.id,
      status: { $in: ['OPEN', 'ACKNOWLEDGED', 'UNDER_REVIEW'] },
      type: 'SOS'
    });

    if (existingSOS) {
      return res.status(400).json({ 
        success: false, 
        message: 'An active SOS already exists for this booking',
        data: existingSOS
      });
    }

    const sosEvent = await EmergencyEvent.create({
      booking: bookingId,
      triggeredBy: req.user.id,
      triggeredByRole: req.user.role,
      type: 'SOS',
      category: 'OTHER', // Can be updated by admin or user later
      location,
      priority: 'URGENT',
      status: 'OPEN'
    });

    const populatedEvent = await EmergencyEvent.findById(sosEvent._id)
      .populate('triggeredBy', 'name phone')
      .populate({ path: 'booking', populate: { path: 'station platform', select: 'name' } });

    // Emit via Socket.io
    try {
      const io = getIo();
      // Notify Admin Safety Room
      io.to('admin:safety').emit('emergency:sos', populatedEvent);
      // Notify Booking Room
      io.to(`booking:${bookingId}`).emit('emergency:sos', populatedEvent);
    } catch (socketErr) {
      console.error('Socket emission failed', socketErr);
    }

    // Notifications
    await sendNotification({
      recipient: req.user.id,
      title: 'SOS Triggered',
      message: 'Your SOS alert has been sent to the RailPorter Safety Team. Stay calm, help is on the way.',
      type: 'ERROR',
      booking: bookingId
    });

    // Notify the counterpart (passenger/porter) if configured/needed
    // ...

    res.status(201).json({ success: true, data: populatedEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Report Safety Incident
// @route   POST /api/emergency/incidents
// @access  Private
exports.reportIncident = async (req, res) => {
  try {
    const { bookingId, category, description, location } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const isPassenger = booking.passenger.toString() === req.user.id;
    const isPorter = booking.porter?.toString() === req.user.id;
    if (!isPassenger && !isPorter) {
      return res.status(403).json({ success: false, message: 'Not authorized for this booking' });
    }

    const incident = await EmergencyEvent.create({
      booking: bookingId,
      triggeredBy: req.user.id,
      triggeredByRole: req.user.role,
      type: 'SAFETY_INCIDENT',
      category,
      description,
      location,
      priority: 'HIGH',
      status: 'OPEN'
    });

    res.status(201).json({ success: true, data: incident });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Emergency Event by ID
// @route   GET /api/emergency/:id
// @access  Private
exports.getEmergencyById = async (req, res) => {
  try {
    const event = await EmergencyEvent.findById(req.params.id)
      .populate('triggeredBy', 'name phone')
      .populate({ path: 'booking', populate: { path: 'station platform', select: 'name' } });

    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const isPassenger = event.booking.passenger?.toString() === req.user.id;
    const isPorter = event.booking.porter?.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isPassenger && !isPorter && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get emergencies for a specific booking
// @route   GET /api/bookings/:bookingId/emergencies
// @access  Private
exports.getBookingEmergencies = async (req, res) => {
  try {
    const bookingId = req.params.bookingId || req.params.id;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const isPassenger = booking.passenger.toString() === req.user.id;
    const isPorter = booking.porter?.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isPassenger && !isPorter && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const events = await EmergencyEvent.find({ booking: bookingId }).sort('-createdAt');
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
