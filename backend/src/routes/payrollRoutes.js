const express = require('express');
const { generatePayroll, getMyPayroll, getAllPayroll, updatePayroll, downloadPayslip } = require('../controllers/payrollController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/generate', authorize('hr'), generatePayroll);
router.get('/all', authorize('hr'), getAllPayroll);
router.get('/download/:id', downloadPayslip);
router.put('/:id', authorize('hr'), updatePayroll);
router.get('/me', getMyPayroll);

module.exports = router;
