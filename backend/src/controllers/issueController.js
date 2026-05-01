const { createNotification, notifyHRs } = require('../utils/notificationUtils');
const Issue = require('../models/Issue');
const Employee = require('../models/Employee');

// @desc    Create new issue
// @route   POST /api/issues
// @access  Private
exports.createIssue = async (req, res, next) => {
    try {
        const employee = await Employee.findOne({ user: req.user.id });
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee profile not found' });
        }

        const issue = await Issue.create({
            employee: employee._id,
            ...req.body
        });

        await notifyHRs('New Issue Reported', `An employee reported a new issue: ${req.body.title}`, 'general');
        res.status(201).json({ success: true, data: issue });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all issues (Admin/HR)
// @route   GET /api/issues
// @access  Private (Admin/HR)
exports.getAllIssues = async (req, res, next) => {
    try {
        const issues = await Issue.find().populate({
            path: 'employee',
            populate: { path: 'user', select: 'name' }
        }).sort('-createdAt');
        res.status(200).json({ success: true, data: issues });
    } catch (err) {
        next(err);
    }
};

// @desc    Get my issues
// @route   GET /api/issues/me
// @access  Private
exports.getMyIssues = async (req, res, next) => {
    try {
        const employee = await Employee.findOne({ user: req.user.id });
        const issues = await Issue.find({ employee: employee._id }).sort('-createdAt');
        res.status(200).json({ success: true, data: issues });
    } catch (err) {
        next(err);
    }
};

// @desc    Update issue status
// @route   PUT /api/issues/:id
// @access  Private (Admin/HR)
exports.updateIssueStatus = async (req, res, next) => {
    try {
        let issue = await Issue.findById(req.params.id).populate({
            path: 'employee',
            populate: { path: 'user', select: 'name email' }
        });

        if (!issue) {
            return res.status(404).json({ success: false, message: 'Issue not found' });
        }

        const { status } = req.body;
        issue.status = status;
        await issue.save();

        // Send email notification if resolved
        if (status === 'resolved') {
            try {
                const sendEmail = require('../services/emailService');
                await sendEmail({
                    email: issue.employee.user.email,
                    subject: `Issue Resolved: ${issue.title}`,
                    message: `Hello ${issue.employee.user.name},\n\nYour reported issue "${issue.title}" has been marked as RESOLVED by HR.\n\nDescription: ${issue.description}\n\nThank you.`
                });
            } catch (emailErr) {
                console.error('Email could not be sent:', emailErr.message);
            }
        }

        if (status === 'resolved') {
            await createNotification(issue.employee.user._id, 'Issue Resolved', `Your issue "${issue.title}" has been resolved.`, 'general');
        }
        res.status(200).json({ success: true, data: issue });
    } catch (err) {
        next(err);
    }
};
