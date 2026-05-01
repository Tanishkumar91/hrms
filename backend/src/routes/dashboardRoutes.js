const express = require('express');
const { getStats, getMyStats } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/stats', authorize('hr'), getStats);
router.get('/stats/me', getMyStats);

module.exports = router;
