const { createNotification, notifyHRs } = require('../utils/notificationUtils');
const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const sendEmail = require('../services/emailService');

// @desc    Request leave
// @route   POST /api/leaves
// @access  Private
exports.requestLeave = async (req, res, next) => {
    try {
        let employee = await Employee.findOne({ user: req.user.id });
        
        // Self-healing: Create employee profile if missing
        if (!employee && req.user.role === 'employee') {
            employee = await Employee.create({
                user: req.user.id,
                employeeId: `EMP${Math.floor(1000 + Math.random() * 9000)}`,
                designation: 'Associate',
                department: 'General',
                dateOfJoining: new Date(),
                salary: { base: 30000, allowances: 0, deductions: 0 }
            });
        }

        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee profile not found' });
        }

        const leave = await Leave.create({
            employee: employee._id,
            ...req.body
        });

        await notifyHRs('New Leave Request', `An employee requested leave from ${new Date(req.body.startDate).toLocaleDateString()} to ${new Date(req.body.endDate).toLocaleDateString()}`, 'leave');
        res.status(201).json({ success: true, data: leave });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all leave requests (Admin/HR)
// @route   GET /api/leaves
// @access  Private (Admin/HR)
exports.getAllLeaves = async (req, res, next) => {
    try {
        const leaves = await Leave.find().populate({
            path: 'employee',
            populate: { path: 'user', select: 'name' }
        }).sort('-appliedDate');
        res.status(200).json({ success: true, data: leaves });
    } catch (err) {
        next(err);
    }
};

// @desc    Approve/Reject leave
// @route   PUT /api/leaves/:id
// @access  Private (Admin/HR)
exports.updateLeaveStatus = async (req, res, next) => {
    try {
        let leave = await Leave.findById(req.params.id).populate({
            path: 'employee',
            populate: { path: 'user', select: 'name email' }
        });

        if (!leave) {
            return res.status(404).json({ success: false, message: 'Leave request not found' });
        }

        const { status, rejectionReason } = req.body;
        leave.status = status;
        leave.rejectionReason = rejectionReason;
        leave.approvedBy = req.user.id;

        await leave.save();

        // Send email notification
        try {
            await sendEmail({
                email: leave.employee.user.email,
                subject: `Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
                message: `Your leave request from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been ${status}. ${rejectionReason ? 'Reason: ' + rejectionReason : ''}`
            });
        } catch (emailErr) {
            console.error('Email could not be sent:', emailErr.message);
        }

        await createNotification(leave.employee.user._id, `Leave ${status}`, `Your leave request has been ${status}.`, 'leave');
        res.status(200).json({ success: true, data: leave });
    } catch (err) {
        next(err);
    }
};

// @desc    Get my leave requests
// @route   GET /api/leaves/me
// @access  Private
exports.getMyLeaves = async (req, res, next) => {
    try {
        const employee = await Employee.findOne({ user: req.user.id });
        const leaves = await Leave.find({ employee: employee._id }).sort('-appliedDate');
        res.status(200).json({ success: true, data: leaves });
    } catch (err) {
        next(err);
    }
};
