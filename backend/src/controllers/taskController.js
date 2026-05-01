const Task = require('../models/Task');
const Employee = require('../models/Employee');
const { createNotification } = require('../utils/notificationUtils');

// Priority multipliers for scoring
const PRIORITY_MULTIPLIER = { low: 1, medium: 1.5, high: 2, critical: 3 };

// @desc    Assign a task to an employee
// @route   POST /api/tasks
// @access  Private (HR)
exports.createTask = async (req, res, next) => {
    try {
        const { title, description, assignedTo, priority, dueDate } = req.body;

        const employee = await Employee.findById(assignedTo).populate('user');
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        const task = await Task.create({
            title,
            description,
            assignedTo,
            assignedBy: req.user.id,
            priority: priority || 'medium',
            dueDate
        });

        // Notify the employee
        await createNotification(
            employee.user._id,
            '📋 New Task Assigned',
            `You have been assigned a new task: "${title}". Due: ${new Date(dueDate).toLocaleDateString()}.`,
            'general'
        );

        res.status(201).json({ success: true, data: task });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all tasks (HR view)
// @route   GET /api/tasks
// @access  Private (HR)
exports.getAllTasks = async (req, res, next) => {
    try {
        const tasks = await Task.find()
            .populate({ path: 'assignedTo', populate: { path: 'user', select: 'name' } })
            .populate('assignedBy', 'name')
            .sort('-createdAt');

        res.status(200).json({ success: true, data: tasks });
    } catch (err) {
        next(err);
    }
};

// @desc    Get tasks for the logged-in employee
// @route   GET /api/tasks/me
// @access  Private (Employee)
exports.getMyTasks = async (req, res, next) => {
    try {
        const employee = await Employee.findOne({ user: req.user.id });
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee profile not found' });
        }

        const tasks = await Task.find({ assignedTo: employee._id })
            .populate('assignedBy', 'name')
            .sort('-createdAt');

        res.status(200).json({ success: true, data: tasks });
    } catch (err) {
        next(err);
    }
};

// @desc    Update task status (employee progresses task)
// @route   PUT /api/tasks/:id/status
// @access  Private
exports.updateTaskStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const task = await Task.findById(req.params.id)
            .populate({ path: 'assignedTo', populate: { path: 'user', select: 'name _id' } })
            .populate('assignedBy', 'name _id');

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        task.status = status;

        // Award points on completion
        if (status === 'completed') {
            task.completedAt = new Date();
            const isOnTime = new Date() <= new Date(task.dueDate);
            const multiplier = PRIORITY_MULTIPLIER[task.priority] || 1;
            task.points = Math.round((isOnTime ? 10 : 5) * multiplier);

            // Notify HR that task was completed
            await createNotification(
                task.assignedBy._id,
                '✅ Task Completed',
                `${task.assignedTo.user.name} completed the task: "${task.title}". Points awarded: ${task.points}.`,
                'general'
            );
        }

        await task.save();
        res.status(200).json({ success: true, data: task });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private (HR)
exports.deleteTask = async (req, res, next) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};

// @desc    Get performance analytics for all employees
// @route   GET /api/tasks/performance
// @access  Private (HR)
exports.getPerformance = async (req, res, next) => {
    try {
        const stats = await Task.aggregate([
            {
                $group: {
                    _id: '$assignedTo',
                    totalAssigned: { $sum: 1 },
                    completed: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    },
                    inProgress: {
                        $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
                    },
                    overdue: {
                        $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0] }
                    },
                    pending: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                    }
                }
            },
            {
                $addFields: {
                    completionRate: {
                        $cond: [
                            { $gt: ['$totalAssigned', 0] },
                            { $multiply: [{ $divide: ['$completed', '$totalAssigned'] }, 100] },
                            0
                        ]
                    }
                }
            },
            { $match: { totalAssigned: { $gt: 0 } } },
            { $sort: { completionRate: -1 } }
        ]);

        const populated = await Employee.populate(stats, {
            path: '_id',
            populate: { path: 'user', select: 'name email' }
        });

        const result = populated.map((entry) => ({
            employee: entry._id,
            totalAssigned: entry.totalAssigned,
            completed: entry.completed,
            inProgress: entry.inProgress,
            overdue: entry.overdue,
            pending: entry.pending,
            completionRate: Math.round(entry.completionRate)
        }));

        res.status(200).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
};

