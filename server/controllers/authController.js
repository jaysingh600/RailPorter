const User = require('../models/User');
const PorterProfile = require('../models/PorterProfile');

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({ success: true, token, user });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role, station, experience, languages, workingPlatforms } = req.body;

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: role || 'passenger'
    });

    // If role is porter, create associated profile
    if (user.role === 'porter') {
      if (!station || !experience || !languages || !workingPlatforms) {
        // Rollback user creation if profile data is missing
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({ success: false, message: 'Please provide station, platforms, experience, and languages for porter registration' });
      }
      
      await PorterProfile.create({
        user: user._id,
        station,
        workingPlatforms,
        experience,
        languages,
        verificationStatus: 'VERIFIED'
      });
    }

    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Validate email/mobile and password
    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email/mobile and password' });
    }

    // Check if identifier is email or phone
    const isEmail = identifier.includes('@');
    const query = isEmail ? { email: identifier } : { phone: identifier };

    // Check for user
    const user = await User.findOne(query).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Quick Login/Signup for Passenger
// @route   POST /api/auth/quick
// @access  Public
exports.quickLogin = async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and Phone are required' });
    }

    let user = await User.findOne({ phone });
    if (!user) {
      // Auto-generate email and password for seamless passenger access
      const email = `${phone}@railporter.com`;
      const password = `${phone}Aa!`; // Meets minimum complexity rules if any
      
      user = await User.create({
        name,
        phone,
        email,
        password,
        role: 'passenger'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
