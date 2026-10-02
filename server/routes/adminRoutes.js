const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { 
  getDashboardOverview, 
  getPorters, 
  getPorterById,
  verifyPorter,
  rejectPorter,
  suspendPorter,
  activatePorter,
  getUsers,
  suspendUser,
  activateUser,
  getComplaints,
  getAllBookings,
  getBookingById
} = require('../controllers/adminController');

const {
  createStation, updateStation, deleteStation,
  createPlatform, updatePlatform, deletePlatform,
  createPickupPoint, updatePickupPoint, deletePickupPoint
} = require('../controllers/adminStationController');

const { resolveComplaint, updateComplaintStatus } = require('../controllers/complaintController'); // Use existing resolve
const { getAuditLogs } = require('../controllers/adminAuditController');
const { getSettings, updateSetting } = require('../controllers/adminSettingsController');
const { 
  getAllEmergencies, 
  getEmergencyById: getAdminEmergencyById, 
  acknowledgeEmergency, 
  updateStatus, 
  resolveEmergency 
} = require('../controllers/adminEmergencyController');

router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/overview', getDashboardOverview);

// Porter Management
router.get('/porters', getPorters);
router.get('/porters/:id', getPorterById);
router.patch('/porters/:id/verify', verifyPorter);
router.patch('/porters/:id/reject', rejectPorter);
router.patch('/porters/:id/suspend', suspendPorter);
router.patch('/porters/:id/activate', activatePorter);

// User Management
router.get('/users', getUsers);
router.patch('/users/:id/suspend', suspendUser);
router.patch('/users/:id/activate', activateUser);

// Bookings & Operations
router.get('/bookings', getAllBookings);
router.get('/bookings/:id', getBookingById);

// Complaints
router.get('/complaints', getComplaints);
router.patch('/complaints/:id', updateComplaintStatus); // Map to the updated complaint controller function

// Emergencies / Safety
router.get('/emergencies', getAllEmergencies);
router.get('/emergencies/:id', getAdminEmergencyById);
router.patch('/emergencies/:id/acknowledge', acknowledgeEmergency);
router.patch('/emergencies/:id/status', updateStatus);
router.patch('/emergencies/:id/resolve', resolveEmergency);

// Audit Logs & Settings
router.get('/audit-logs', getAuditLogs);
router.get('/settings', getSettings);
router.put('/settings/:key', updateSetting);

// Station Management
router.post('/stations', createStation);
router.put('/stations/:id', updateStation);
router.delete('/stations/:id', deleteStation);

router.post('/platforms', createPlatform);
router.put('/platforms/:id', updatePlatform);
router.delete('/platforms/:id', deletePlatform);

router.post('/pickup-points', createPickupPoint);
router.put('/pickup-points/:id', updatePickupPoint);
router.delete('/pickup-points/:id', deletePickupPoint);

module.exports = router;
