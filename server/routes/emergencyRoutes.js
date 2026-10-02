const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  triggerSOS, 
  reportIncident, 
  getEmergencyById 
} = require('../controllers/emergencyController');

const emergencyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit to 5 SOS/incident reports per 15 min to prevent spam
  message: { success: false, message: 'Too many emergency requests. Please try again later.' }
});

router.use(protect);

router.post('/sos', emergencyLimiter, triggerSOS);
router.post('/incidents', emergencyLimiter, reportIncident);
router.get('/:id', getEmergencyById);

module.exports = router;
