const EmergencyContact = require('../models/EmergencyContact');

// @desc    Get my contacts
// @route   GET /api/emergency-contacts
// @access  Private
exports.getContacts = async (req, res) => {
  try {
    const contacts = await EmergencyContact.find({ user: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, data: contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add contact
// @route   POST /api/emergency-contacts
// @access  Private
exports.addContact = async (req, res) => {
  try {
    // Limit to 5 contacts max
    const count = await EmergencyContact.countDocuments({ user: req.user.id });
    if (count >= 5) {
      return res.status(400).json({ success: false, message: 'Maximum 5 emergency contacts allowed' });
    }

    const { name, relationship, phone, isPrimary } = req.body;
    
    // If it's the first contact, make it primary automatically
    const primary = count === 0 ? true : isPrimary;

    const contact = await EmergencyContact.create({
      user: req.user.id,
      name,
      relationship,
      phone,
      isPrimary: primary
    });

    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update contact
// @route   PUT /api/emergency-contacts/:id
// @access  Private
exports.updateContact = async (req, res) => {
  try {
    const { name, relationship, phone, isPrimary } = req.body;
    
    const contact = await EmergencyContact.findOne({ _id: req.params.id, user: req.user.id });
    if (!contact) return res.status(404).json({ success: false, message: 'Contact not found' });

    contact.name = name || contact.name;
    contact.relationship = relationship || contact.relationship;
    contact.phone = phone || contact.phone;
    
    if (isPrimary !== undefined) {
      contact.isPrimary = isPrimary;
    }

    await contact.save();
    res.status(200).json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete contact
// @route   DELETE /api/emergency-contacts/:id
// @access  Private
exports.deleteContact = async (req, res) => {
  try {
    const contact = await EmergencyContact.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!contact) return res.status(404).json({ success: false, message: 'Contact not found' });

    // If it was primary, randomly assign primary to another
    if (contact.isPrimary) {
      const nextContact = await EmergencyContact.findOne({ user: req.user.id });
      if (nextContact) {
        nextContact.isPrimary = true;
        await nextContact.save();
      }
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
