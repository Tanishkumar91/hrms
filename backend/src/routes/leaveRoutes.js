const express = require('express');
const { requestLeave, getAllLeaves, updateLeaveStatus, getMyLeaves } = require('../controllers/leaveController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', requestLeave);
router.get('/', authorize('hr'), getAllLeaves);
router.put('/:id', authorize('hr'), updateLeaveStatus);
router.get('/me', getMyLeaves);

module.exports = router;
