const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { 
  createComplaint, 
  getMyComplaints, 
  getComplaintById,
  getAllComplaints,
  updateComplaintStatus
} = require('../controllers/complaintController');

router.use(protect);

// Passenger / Porter routes
router.post('/', authorize('passenger'), createComplaint);
router.get('/me', getMyComplaints);
router.get('/:id', getComplaintById);

// Admin routes
router.get('/admin/all', authorize('admin'), getAllComplaints);
router.patch('/admin/:id', authorize('admin'), updateComplaintStatus);

module.exports = router;
