const SystemSetting = require('../models/SystemSetting');
const AdminAuditLog = require('../models/AdminAuditLog');

// @desc    Get all settings
// @route   GET /api/admin/settings
// @access  Private (Admin)
exports.getSettings = async (req, res) => {
  try {
    const settings = await SystemSetting.find().select('-__v');
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a setting
// @route   PUT /api/admin/settings/:key
// @access  Private (Admin)
exports.updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;

    let setting = await SystemSetting.findOne({ key });
    
    if (setting) {
      setting.value = value;
      if (description) setting.description = description;
      setting.lastModifiedBy = req.user.id;
      await setting.save();
    } else {
      setting = await SystemSetting.create({
        key,
        value,
        description,
        lastModifiedBy: req.user.id
      });
    }

    // Log the audit
    await AdminAuditLog.create({
      admin: req.user.id,
      action: 'SETTING_UPDATED',
      targetType: 'SystemSetting',
      targetId: setting._id,
      reason: `Updated ${key}`,
      ipAddress: req.ip || '',
      userAgent: req.headers && req.headers['user-agent'] ? req.headers['user-agent'] : ''
    });

    res.status(200).json({ success: true, data: setting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
