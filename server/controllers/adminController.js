const User = require('../models/User');
const Booking = require('../models/Booking');
const Complaint = require('../models/Complaint');
const PorterProfile = require('../models/PorterProfile');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const AdminAuditLog = require('../models/AdminAuditLog');

// Helper to log audit
const logAudit = async (adminId, action, targetType, targetId, reason = '', req = {}) => {
  try {
    await AdminAuditLog.create({
      admin: adminId,
      action,
      targetType,
      targetId,
      reason,
      ipAddress: req.ip || '',
      userAgent: req.headers && req.headers['user-agent'] ? req.headers['user-agent'] : ''
    });
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
};

// @desc    Get dashboard overview stats
// @route   GET /api/admin/overview
// @access  Private (Admin)
exports.getDashboardOverview = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPassengers = await User.countDocuments({ role: 'passenger' });
    const totalPorters = await User.countDocuments({ role: 'porter' });
    
    const verifiedPorters = await PorterProfile.countDocuments({ verificationStatus: 'VERIFIED' });
    const pendingPorters = await PorterProfile.countDocuments({ verificationStatus: 'PENDING' });
    const suspendedPorters = await PorterProfile.countDocuments({ verificationStatus: 'SUSPENDED' });
    
    const activeBookings = await Booking.countDocuments({ status: { $in: ['REQUESTED', 'ACCEPTED', 'REACHED_PLATFORM', 'LUGGAGE_PICKED', 'IN_TRANSIT'] } });
    const completedBookings = await Booking.countDocuments({ status: 'COMPLETED' });
    const cancelledBookings = await Booking.countDocuments({ status: 'CANCELLED' });
    
    const payments = await Payment.aggregate([
      { $match: { status: 'SUCCESS' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' }, platformCommission: { $sum: '$platformCommission' } } }
    ]);

    const totalRevenue = payments.length > 0 ? payments[0].totalRevenue : 0;
    const platformCommission = payments.length > 0 ? payments[0].platformCommission : 0;

    const openComplaints = await Complaint.countDocuments({ status: { $in: ['OPEN', 'UNDER_REVIEW'] } });

    res.status(200).json({
      success: true,
      data: {
        users: { total: totalUsers, passengers: totalPassengers, porters: totalPorters },
        porters: { verified: verifiedPorters, pending: pendingPorters, suspended: suspendedPorters },
        bookings: { active: activeBookings, completed: completedBookings, cancelled: cancelledBookings },
        payments: { totalRevenue, platformCommission },
        complaints: { open: openComplaints }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// PORTER MANAGEMENT
// ==========================================

// @desc    Get all porters
// @route   GET /api/admin/porters
// @access  Private (Admin)
exports.getPorters = async (req, res) => {
  try {
    const { status, station, platform, search } = req.query;
    
    // Base query for user collection
    const userQuery = { role: 'porter' };
    if (search) {
      userQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    let porters = await User.find(userQuery).select('-password');
    let porterIds = porters.map(p => p._id);
    
    // Query for profiles
    const profileQuery = { user: { $in: porterIds } };
    if (status) profileQuery.verificationStatus = status;
    if (station) profileQuery.station = station;
    if (platform) profileQuery.workingPlatforms = platform;
    
    const profiles = await PorterProfile.find(profileQuery)
      .populate('station', 'name code')
      .populate('workingPlatforms', 'name');
    
    // Merge
    const merged = profiles.map(profile => {
      const p = porters.find(user => user._id.toString() === profile.user.toString());
      if (!p) return null; // Should not happen
      return {
        _id: p._id,
        name: p.name,
        email: p.email,
        phone: p.phone,
        isActive: p.isActive,
        profileImage: p.profileImage,
        createdAt: p.createdAt,
        station: profile.station,
        workingPlatforms: profile.workingPlatforms,
        experience: profile.experience,
        rating: profile.rating,
        totalCompletedBookings: profile.totalCompletedBookings,
        verificationStatus: profile.verificationStatus,
        availabilityStatus: profile.availabilityStatus
      };
    }).filter(Boolean);

    res.status(200).json({ success: true, data: merged });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get porter by ID
// @route   GET /api/admin/porters/:id
// @access  Private (Admin)
exports.getPorterById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user || user.role !== 'porter') {
      return res.status(404).json({ success: false, message: 'Porter not found' });
    }
    
    const profile = await PorterProfile.findOne({ user: req.params.id })
      .populate('station', 'name code city')
      .populate('workingPlatforms', 'name')
      .populate('rejectedBy', 'name')
      .populate('suspendedBy', 'name');
      
    res.status(200).json({ success: true, data: { user, profile } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify porter
// @route   PATCH /api/admin/porters/:id/verify
// @access  Private (Admin)
exports.verifyPorter = async (req, res) => {
  try {
    const profile = await PorterProfile.findOneAndUpdate(
      { user: req.params.id }, 
      { 
        verificationStatus: 'VERIFIED',
        verificationReason: '',
        isActive: true
      }, 
      { new: true }
    );
    
    if (!profile) return res.status(404).json({ success: false, message: 'Porter profile not found' });
    
    // Update User model just in case
    await User.findByIdAndUpdate(req.params.id, { isActive: true });

    await logAudit(req.user.id, 'PORTER_VERIFIED', 'PorterProfile', profile._id, '', req);
    
    await Notification.create({
      user: req.params.id,
      title: 'Verification Update',
      message: 'Congratulations! Your profile has been verified. You can now go online.',
      type: 'SUCCESS'
    });

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject porter
// @route   PATCH /api/admin/porters/:id/reject
// @access  Private (Admin)
exports.rejectPorter = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ success: false, message: 'Reason is required' });

    const profile = await PorterProfile.findOneAndUpdate(
      { user: req.params.id }, 
      { 
        verificationStatus: 'REJECTED',
        verificationReason: reason,
        rejectedAt: new Date(),
        rejectedBy: req.user.id,
        availabilityStatus: 'OFFLINE'
      }, 
      { new: true }
    );
    
    if (!profile) return res.status(404).json({ success: false, message: 'Porter profile not found' });

    await logAudit(req.user.id, 'PORTER_REJECTED', 'PorterProfile', profile._id, reason, req);

    await Notification.create({
      user: req.params.id,
      title: 'Verification Rejected',
      message: `Your profile verification was rejected. Reason: ${reason}`,
      type: 'ERROR'
    });

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Suspend porter
// @route   PATCH /api/admin/porters/:id/suspend
// @access  Private (Admin)
exports.suspendPorter = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ success: false, message: 'Reason is required' });

    // Check for active bookings before suspending
    const activeStatuses = ['REQUESTED', 'ACCEPTED', 'REACHED_PLATFORM', 'LUGGAGE_PICKED', 'IN_TRANSIT'];
    const activeBooking = await Booking.findOne({ porter: req.params.id, status: { $in: activeStatuses } });
    
    if (activeBooking && !req.body.force) {
      return res.status(400).json({ 
        success: false, 
        message: 'Porter has an active booking.', 
        hasActiveBooking: true,
        bookingId: activeBooking._id
      });
    }

    const profile = await PorterProfile.findOneAndUpdate(
      { user: req.params.id }, 
      { 
        verificationStatus: 'SUSPENDED',
        suspensionReason: reason,
        suspendedAt: new Date(),
        suspendedBy: req.user.id,
        availabilityStatus: 'OFFLINE'
      }, 
      { new: true }
    );
    
    if (!profile) return res.status(404).json({ success: false, message: 'Porter profile not found' });
    
    await logAudit(req.user.id, 'PORTER_SUSPENDED', 'PorterProfile', profile._id, reason, req);

    await Notification.create({
      user: req.params.id,
      title: 'Account Suspended',
      message: `Your porter account has been suspended. Reason: ${reason}`,
      type: 'ERROR'
    });

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Activate suspended/rejected porter
// @route   PATCH /api/admin/porters/:id/activate
// @access  Private (Admin)
exports.activatePorter = async (req, res) => {
  try {
    const profile = await PorterProfile.findOneAndUpdate(
      { user: req.params.id }, 
      { 
        verificationStatus: 'VERIFIED',
        availabilityStatus: 'OFFLINE'
      }, 
      { new: true }
    );
    
    if (!profile) return res.status(404).json({ success: false, message: 'Porter profile not found' });
    
    await logAudit(req.user.id, 'PORTER_ACTIVATED', 'PorterProfile', profile._id, '', req);

    await Notification.create({
      user: req.params.id,
      title: 'Account Activated',
      message: 'Your account has been reactivated. You may now go online.',
      type: 'SUCCESS'
    });

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// USER MANAGEMENT
// ==========================================

// @desc    Get all users (passengers + admins)
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res) => {
  try {
    // Only return passengers and admins to separate from porters
    const users = await User.find({ role: { $ne: 'porter' } }).select('-password');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Suspend user
// @route   PATCH /api/admin/users/:id/suspend
// @access  Private (Admin)
exports.suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    // Prevent suspending another admin (for safety)
    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot suspend an admin account' });
    }

    user.isActive = false;
    await user.save();
    
    await logAudit(req.user.id, 'USER_SUSPENDED', 'User', user._id, '', req);

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Activate user
// @route   PATCH /api/admin/users/:id/activate
// @access  Private (Admin)
exports.activateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isActive = true;
    await user.save();
    
    await logAudit(req.user.id, 'USER_ACTIVATED', 'User', user._id, '', req);

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// COMPLAINT MANAGEMENT (Extensions)
// ==========================================

exports.getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('raisedBy', 'name email phone')
      .populate('againstUser', 'name')
      .populate({ path: 'booking', populate: { path: 'porter', select: 'name' } })
      .sort('-createdAt');

    res.status(200).json({ success: true, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Note: resolveComplaint logic exists in complaintController.js as updateComplaintStatus. We should use that, or wrap it if needed.

// ==========================================
// BOOKING / OPERATIONS MANAGEMENT
// ==========================================

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private (Admin)
exports.getAllBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const { status, active } = req.query;
    const query = {};
    
    if (active === 'true') {
      query.status = { $in: ['REQUESTED', 'ACCEPTED', 'REACHED_PLATFORM', 'LUGGAGE_PICKED', 'IN_TRANSIT'] };
    } else if (status) {
      query.status = status;
    }

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('passenger', 'name phone')
      .populate('porter', 'name phone')
      .populate('station', 'name')
      .populate('platform', 'name')
      .sort('-createdAt')
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({ 
      success: true, 
      count: bookings.length, 
      pagination: {
        page, limit, total, totalPages: Math.ceil(total / limit)
      },
      data: bookings 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get booking details
// @route   GET /api/admin/bookings/:id
// @access  Private (Admin)
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('passenger', 'name email phone profileImage')
      .populate('porter', 'name email phone profileImage')
      .populate('station')
      .populate('platform')
      .populate('pickupPoint');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    
    // Fetch associated payment and complaints
    const payment = await Payment.findOne({ booking: req.params.id });
    const complaints = await Complaint.find({ booking: req.params.id });
    
    res.status(200).json({ success: true, data: { booking, payment, complaints } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
