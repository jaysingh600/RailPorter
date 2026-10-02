const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  relationship: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    match: [/^[6-9]\d{9}$/, 'Please add a valid 10-digit Indian mobile number']
  },
  isPrimary: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Ensure a user can only have one primary contact at a time
emergencyContactSchema.pre('save', async function(next) {
  if (this.isPrimary) {
    await this.model('EmergencyContact').updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { $set: { isPrimary: false } }
    );
  }
  next();
});

module.exports = mongoose.model('EmergencyContact', emergencyContactSchema);
