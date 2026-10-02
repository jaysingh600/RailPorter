const Complaint = require('../models/Complaint');
const Booking = require('../models/Booking');
const { sendNotification } = require('../services/notificationService');

// @desc    Create complaint
// @route   POST /api/complaints
// @access  Private (Passenger)
exports.createComplaint = async (req, res) => {
  try {
    const { bookingId, category, subject, description, priority } = req.body;
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.passenger.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to file a complaint for this booking' });
    }

    if (!booking.porter) {
      return res.status(400).json({ success: false, message: 'Cannot file a complaint against an unassigned booking' });
    }

    const complaint = await Complaint.create({
      booking: bookingId,
      raisedBy: req.user.id,
      againstUser: booking.porter, // Automatically derived from the DB!
      category,
      subject,
      description,
      priority: priority || 'MEDIUM'
    });

    // Notify Passenger that complaint was received
    await sendNotification({
      recipient: req.user.id,
      title: 'Complaint Received',
      message: `Your issue regarding booking #${bookingId.toString().slice(-6).toUpperCase()} is now UNDER REVIEW.`,
      type: 'INFO',
      booking: bookingId
    });

    res.status(201).json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in user complaints
// @route   GET /api/complaints/me
// @access  Private
exports.getMyComplaints = async (req, res) => {
  try {
    const query = req.user.role === 'passenger' 
      ? { raisedBy: req.user.id } 
      : { againstUser: req.user.id };

    const complaints = await Complaint.find(query)
      .populate('againstUser', 'name')
      .populate('booking', 'station platform createdAt')
      .sort('-createdAt');

    res.status(200).json({ success: true, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get complaint by ID
// @route   GET /api/complaints/:id
// @access  Private
exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('raisedBy', 'name email phone')
      .populate('againstUser', 'name email phone')
      .populate({ path: 'booking', populate: { path: 'station platform', select: 'name' } });

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Auth check
    if (
      req.user.role !== 'admin' &&
      complaint.raisedBy._id.toString() !== req.user.id &&
      complaint.againstUser._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this complaint' });
    }

    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all complaints (Admin)
// @route   GET /api/complaints/admin/all
// @access  Private (Admin)
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('raisedBy', 'name')
      .populate('againstUser', 'name')
      .populate('booking', 'createdAt')
      .sort('-createdAt');

    res.status(200).json({ success: true, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update complaint status (Admin)
// @route   PATCH /api/complaints/admin/:id
// @access  Private (Admin)
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status, adminResponse, resolution } = req.body;
    
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (status) complaint.status = status;
    if (adminResponse) complaint.adminResponse = adminResponse;
    
    if (status === 'RESOLVED' || resolution) {
      complaint.resolution = resolution;
      complaint.resolvedAt = new Date();
    }

    await complaint.save();

    // Notify the passenger of the update
    await sendNotification({
      recipient: complaint.raisedBy,
      title: 'Complaint Updated',
      message: `Your complaint #${complaint._id.toString().slice(-6).toUpperCase()} status changed to ${complaint.status}.`,
      type: 'INFO',
      booking: complaint.booking
    });

    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
