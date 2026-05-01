const express = require('express');
const { checkIn, checkOut, getMyAttendance, getAllAttendance } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', authorize('hr'), getAllAttendance);
router.post('/check-in', checkIn);
router.put('/check-out', checkOut);
router.get('/me', getMyAttendance);

module.exports = router;
