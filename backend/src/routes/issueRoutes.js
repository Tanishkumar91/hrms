const express = require('express');
const { createIssue, getAllIssues, getMyIssues, updateIssueStatus } = require('../controllers/issueController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', createIssue);
router.get('/', authorize('hr'), getAllIssues);
router.get('/me', getMyIssues);
router.put('/:id', authorize('hr'), updateIssueStatus);

module.exports = router;
