const express = require('express');
const router = express.Router();
const {
    createTask,
    getAllTasks,
    getMyTasks,
    updateTaskStatus,
    deleteTask,
    getPerformance
} = require('../controllers/taskController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
    .get(authorize('hr'), getAllTasks)
    .post(authorize('hr'), createTask);

router.get('/me', getMyTasks);
router.get('/performance', authorize('hr'), getPerformance);

router.route('/:id/status')
    .put(updateTaskStatus);

router.route('/:id')
    .delete(authorize('hr'), deleteTask);

module.exports = router;
