const EmergencyEvent = require('../models/EmergencyEvent');
const AdminAuditLog = require('../models/AdminAuditLog');
const { sendNotification } = require('../services/notificationService');
const { getIo } = require('../socket');

const logAudit = async (adminId, action, targetId, reason, req) => {
  try {
    await AdminAuditLog.create({
      admin: adminId,
      action,
      targetType: 'EmergencyEvent',
      targetId,
      reason,
      ipAddress: req.ip || '',
      userAgent: req.headers && req.headers['user-agent'] ? req.headers['user-agent'] : ''
    });
  } catch (error) {
    console.error('Failed to log emergency audit', error);
  }
};

// @desc    Get all emergencies (Admin)
// @route   GET /api/admin/emergencies
// @access  Private (Admin)
exports.getAllEmergencies = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const { status, priority, category } = req.query;
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;

    const total = await EmergencyEvent.countDocuments(query);
    const emergencies = await EmergencyEvent.find(query)
      .populate('triggeredBy', 'name phone')
      .populate({ path: 'booking', populate: { path: 'station platform', select: 'name' } })
      .sort('-createdAt')
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({ 
      success: true, 
      count: emergencies.length, 
      pagination: {
        page, limit, total, totalPages: Math.ceil(total / limit)
      },
      data: emergencies 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get emergency by ID
// @route   GET /api/admin/emergencies/:id
// @access  Private (Admin)
exports.getEmergencyById = async (req, res) => {
  try {
    const event = await EmergencyEvent.findById(req.params.id)
      .populate('triggeredBy', 'name phone email')
      .populate('acknowledgedBy', 'name')
      .populate('resolvedBy', 'name')
      .populate({ 
        path: 'booking', 
        populate: [
          { path: 'station platform pickupPoint', select: 'name' },
          { path: 'passenger porter', select: 'name phone' }
        ] 
      });

    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Acknowledge emergency
// @route   PATCH /api/admin/emergencies/:id/acknowledge
// @access  Private (Admin)
exports.acknowledgeEmergency = async (req, res) => {
  try {
    const event = await EmergencyEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    
    if (event.status !== 'OPEN') {
      return res.status(400).json({ success: false, message: 'Event is already acknowledged or resolved' });
    }

    event.status = 'ACKNOWLEDGED';
    event.acknowledgedBy = req.user.id;
    event.acknowledgedAt = new Date();
    await event.save();

    await logAudit(req.user.id, 'EMERGENCY_ACKNOWLEDGED', event._id, '', req);

    await sendNotification({
      recipient: event.triggeredBy,
      title: 'Emergency Acknowledged',
      message: 'Your emergency alert has been acknowledged by the safety team.',
      type: 'INFO',
      booking: event.booking
    });

    try {
      getIo().to(`booking:${event.booking}`).emit('emergency:acknowledged', { emergencyId: event._id });
    } catch (err) {}

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update status
// @route   PATCH /api/admin/emergencies/:id/status
// @access  Private (Admin)
exports.updateStatus = async (req, res) => {
  try {
    const { status, priority, category } = req.body;
    
    const event = await EmergencyEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    
    if (status) event.status = status;
    if (priority) {
      event.priority = priority;
      await logAudit(req.user.id, 'EMERGENCY_PRIORITY_CHANGED', event._id, `Changed to ${priority}`, req);
    }
    if (category) event.category = category;

    await event.save();

    if (status) {
      await logAudit(req.user.id, 'EMERGENCY_STATUS_CHANGED', event._id, `Changed to ${status}`, req);
    }

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resolve emergency
// @route   PATCH /api/admin/emergencies/:id/resolve
// @access  Private (Admin)
exports.resolveEmergency = async (req, res) => {
  try {
    const { resolution } = req.body;
    if (!resolution) {
      return res.status(400).json({ success: false, message: 'Resolution note is required' });
    }

    const event = await EmergencyEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    
    event.status = 'RESOLVED';
    event.resolution = resolution;
    event.resolvedBy = req.user.id;
    event.resolvedAt = new Date();
    await event.save();

    await logAudit(req.user.id, 'EMERGENCY_RESOLVED', event._id, resolution, req);

    await sendNotification({
      recipient: event.triggeredBy,
      title: 'Emergency Resolved',
      message: 'Your reported safety issue has been marked as resolved.',
      type: 'SUCCESS',
      booking: event.booking
    });

    try {
      getIo().to(`booking:${event.booking}`).emit('emergency:resolved', { emergencyId: event._id });
    } catch (err) {}

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
