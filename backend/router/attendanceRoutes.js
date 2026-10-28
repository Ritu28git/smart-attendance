const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  checkIn,
  checkOut,
  startLunch,
  endLunch,
  uploadPhoto,
  getHistory,
  getAllAttendance,
  verifyFace,
} = require('../controllers/attendanceController');

const {
  updateMyLocation,
  getLiveEmployeeLocations,
} = require('../controllers/locationController');

const router = express.Router();

// Employee routes
router.post('/check-in', protect, checkIn);
router.post('/check-out', protect, checkOut);
router.post('/lunch/start', protect, startLunch);
router.post('/lunch/end', protect, endLunch);
router.post('/photo', protect, uploadPhoto);
router.post('/verify-face', protect, verifyFace);
router.get('/history', protect, getHistory);
// Employee: update own live location
router.post('/location', protect, updateMyLocation);

// Admin: view live employee locations
router.get('/admin/live-locations', protect, adminOnly, getLiveEmployeeLocations);

// Admin route to view all attendance records
router.get('/admin', protect, adminOnly, getAllAttendance);

module.exports = router;
