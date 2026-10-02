const AdminAuditLog = require('../models/AdminAuditLog');

// @desc    Get audit logs
// @route   GET /api/admin/audit-logs
// @access  Private (Admin)
exports.getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const { admin, action, targetType } = req.query;
    const query = {};
    if (admin) query.admin = admin;
    if (action) query.action = action;
    if (targetType) query.targetType = targetType;

    const total = await AdminAuditLog.countDocuments(query);
    const logs = await AdminAuditLog.find(query)
      .populate('admin', 'name email')
      .sort('-createdAt')
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: logs.length,
      pagination: {
        page, limit, total, totalPages: Math.ceil(total / limit)
      },
      data: logs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
