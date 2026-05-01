const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// @desc    Check-in
// @route   POST /api/attendance/check-in
// @access  Private (Employee)
exports.checkIn = async (req, res, next) => {
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

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if already checked in today
        const existingAttendance = await Attendance.findOne({
            employee: employee._id,
            date: { $gte: today }
        });

        if (existingAttendance) {
            return res.status(400).json({ success: false, message: 'Already checked in for today' });
        }

        const attendance = await Attendance.create({
            employee: employee._id,
            date: new Date(),
            checkIn: {
                time: new Date(),
                location: req.body?.location || {}
            },
            status: 'present' 
        });

        res.status(201).json({ success: true, data: attendance });
    } catch (err) {
        next(err);
    }
};

// @desc    Check-out
// @route   PUT /api/attendance/check-out
// @access  Private (Employee)
exports.checkOut = async (req, res, next) => {
    try {
        const employee = await Employee.findOne({ user: req.user.id });
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOne({
            employee: employee._id,
            date: { $gte: today }
        });

        if (!attendance) {
            return res.status(404).json({ success: false, message: 'No check-in record found for today' });
        }

        if (attendance.checkOut && attendance.checkOut.time) {
            return res.status(400).json({ success: false, message: 'Already checked out for today' });
        }

        attendance.checkOut = {
            time: new Date(),
            location: req.body?.location || {}
        };

        // Calculate work hours
        const diff = attendance.checkOut.time - attendance.checkIn.time;
        attendance.workHours = (diff / (1000 * 60 * 60)).toFixed(2);

        await attendance.save();

        res.status(200).json({ success: true, data: attendance });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Private (Admin/HR)
exports.getAllAttendance = async (req, res, next) => {
    try {
        const attendance = await Attendance.find()
            .populate({
                path: 'employee',
                populate: { path: 'user', select: 'name' }
            })
            .sort('-date');
        res.status(200).json({ success: true, data: attendance });
    } catch (err) {
        next(err);
    }
};

// @desc    Get attendance for current user
// @route   GET /api/attendance/me
// @access  Private
exports.getMyAttendance = async (req, res, next) => {
    try {
        const employee = await Employee.findOne({ user: req.user.id });
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee profile not found' });
        }
        const attendance = await Attendance.find({ employee: employee._id }).sort('-date');
        res.status(200).json({ success: true, data: attendance });
    } catch (err) {
        next(err);
    }
};
